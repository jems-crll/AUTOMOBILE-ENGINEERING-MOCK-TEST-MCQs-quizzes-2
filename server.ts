import express from "express";
import cors from "cors";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { QUESTIONS } from "./src/data/questions.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

dotenv.config();

// Create Nodemailer transporter
let transporter: nodemailer.Transporter | null = null;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("SMTP Transporter configured successfully.");
  } else {
    console.warn("SMTP configuration missing. OTP emails will only be logged to console.");
  }
} catch (error) {
  console.error("Failed to configure SMTP transporter:", error);
}

// Initialize Firebase Admin with credentials if provided, otherwise default (Cloud Run/ADC)
function getServiceAccount() {
  const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saVar) {
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable is not defined.");
    return null;
  }

  let cleaned = saVar.trim();
  console.log("Analyzing FIREBASE_SERVICE_ACCOUNT environment variable...");

  // 1. Check if it's base64 encoded
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    try {
      console.log("FIREBASE_SERVICE_ACCOUNT is not standard JSON format. Checking if it's base64 encoded...");
      cleaned = Buffer.from(cleaned, 'base64').toString('utf8').trim();
      console.log("Successfully base64 decoded the FIREBASE_SERVICE_ACCOUNT variable.");
    } catch (base64Err: any) {
      console.error("Base64 decoding failed, using original string. Error:", base64Err.message);
    }
  }

  // 2. Parse as JSON
  try {
    const parsed = JSON.parse(cleaned);
    console.log("Successfully parsed FIREBASE_SERVICE_ACCOUNT JSON object.");
    if (parsed && typeof parsed.private_key === "string") {
      // Fix private key formatting (Vercel env vars sometimes have literal \n or double-escaped newlines)
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      console.log("Formatted private_key field with actual newline characters.");
    }
    return parsed;
  } catch (jsonErr: any) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Error:", jsonErr.message);
    
    // 3. Fallback: single-quote to double-quote regex translation
    try {
      let fallbackStr = cleaned
        .replace(/'/g, '"')
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
      const parsedFallback = JSON.parse(fallbackStr);
      if (parsedFallback && typeof parsedFallback.private_key === "string") {
        parsedFallback.private_key = parsedFallback.private_key.replace(/\\n/g, "\n");
      }
      console.log("Parsed FIREBASE_SERVICE_ACCOUNT successfully using fallback regex parser.");
      return parsedFallback;
    } catch (fallbackErr: any) {
      console.error("Fallback parsing also failed:", fallbackErr.message);
    }
  }
  return null;
}

let firebaseApp: any;
let resolvedProjectId = "";

const serviceAccount = getServiceAccount();

if (getApps().length === 0) {
  if (serviceAccount) {
    try {
      console.log("Initializing Firebase Admin with parsed service account credentials...");
      resolvedProjectId = serviceAccount.project_id || "";
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: resolvedProjectId
      });
      console.log(`Firebase Admin successfully initialized. Target Project ID: ${resolvedProjectId}`);
    } catch (e: any) {
      console.error("Failed to initialize Firebase Admin with credentials. Error:", e.message || e);
      try {
        firebaseApp = initializeApp();
        console.log("Firebase Admin fallback initialized with default credentials.");
      } catch (err2: any) {
        console.error("Fallback initialization also failed. Error:", err2.message || err2);
      }
    }
  } else {
    try {
      firebaseApp = initializeApp();
      console.log("Firebase Admin initialized with default credentials.");
    } catch (e: any) {
      console.error("Failed to initialize Firebase Admin with default credentials. Error:", e.message || e);
    }
  }
} else {
  firebaseApp = getApps()[0];
  console.log("Using already initialized Firebase App instance.");
}

if (firebaseApp && firebaseApp.options && firebaseApp.options.projectId) {
  resolvedProjectId = firebaseApp.options.projectId;
} else if (serviceAccount && serviceAccount.project_id) {
  resolvedProjectId = serviceAccount.project_id;
}

// Initialize Firestore on the specified database ID or the default database ID
const dbId = process.env.FIRESTORE_DB_ID || undefined;
const db = dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);

console.log("=========================================");
console.log("FIRESTORE CLIENT INITIALIZATION LOGS:");
console.log(`- Project ID: ${resolvedProjectId || "unknown"}`);
console.log(`- Database ID: ${dbId || "(default)"}`);
console.log(`- Client Email: ${serviceAccount?.client_email || "default credentials"}`);
console.log("=========================================");

// Robust in-memory fallbacks in case Firestore is disabled/unreachable or permission denied
const memoryUsers = new Map<string, any>();
const memoryAttempts = new Map<string, any[]>();
const memoryPayments = new Map<string, any>();
const sseClients: any[] = [];
const onlineUsers = new Map<string, number>();

function broadcastUsers() {
  const now = Date.now();
  let usersList = Array.from(memoryUsers.values());
  usersList = usersList.map(u => {
    const email = typeof u.email === "string" ? u.email.toLowerCase().trim() : "";
    const isOnline = email ? (onlineUsers.has(email) && (now - onlineUsers.get(email)! < 5 * 60 * 1000)) : false;
    return {
      ...u,
      isOnline
    };
  });
  
  // Sort so newest are first
  usersList.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const payload = JSON.stringify({ success: true, users: usersList });
  sseClients.forEach(client => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (_) {}
  });
}

function startRealtimeListener() {
  if (!isFirestoreAvailable) return;
  console.log("[Firestore Realtime] Starting onSnapshot listener for 'users' collection...");
  try {
    db.collection("users").onSnapshot((snapshot) => {
      console.log(`[Firestore Realtime] Received update. ${snapshot.size} documents in 'users' collection.`);
      snapshot.forEach((doc) => {
        const u = doc.data();
        if (u && u.email) {
          const cleanEmail = u.email.toLowerCase().trim();
          memoryUsers.set(cleanEmail, { ...memoryUsers.get(cleanEmail), ...u });
        }
      });
      broadcastUsers();
    }, (error) => {
      handleFirestoreError(error, "startRealtimeListener onSnapshot");
    });
  } catch (e: any) {
    handleFirestoreError(e, "startRealtimeListener catch");
  }
}

let memorySubscriptionConfig = {
  amount: 299,
  originalAmount: 999,
  billingPeriod: "lifetime",
  detailsEn: "Automobile Engg. Premium Pack",
  detailsMr: "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
};

let isFirestoreAvailable = false;

function handleFirestoreError(err: any, context: string) {
  const errMsg = err?.message || String(err);
  const isPermissionOrNotFound = 
    errMsg.includes("PERMISSION_DENIED") || 
    errMsg.includes("NOT_FOUND") || 
    errMsg.includes("Cloud Firestore API") || 
    errMsg.includes("disabled") ||
    errMsg.includes("not found");

  if (isPermissionOrNotFound) {
    if (process.env.FORCE_FIRESTORE === "true") {
      console.log(`[Firestore Status] FORCE_FIRESTORE is true, keeping connection active despite warning in ${context}: ${errMsg}`);
      isFirestoreAvailable = true;
      return;
    }
    isFirestoreAvailable = false;
    console.log("\n==================================================================");
    console.log(`[Firestore Status] Dynamically disabled Firestore due to status in ${context}: ${errMsg}`);
    console.log("\n💡 HOW TO CONNECT YOUR OWN FIREBASE DATABASE (automobile-engineering-mock):");
    console.log("1. Go to Firebase Console: https://console.firebase.google.com/");
    console.log("2. Open your project 'automobile-engineering-mock'.");
    console.log("3. Click Gear Icon (Project Settings) -> Service Accounts tab.");
    console.log("4. Click 'Generate new private key' to download the JSON credentials file.");
    console.log("5. Copy the entire contents of that JSON file.");
    console.log("6. Add a new Environment Variable in your Vercel Dashboard (or AI Studio Settings):");
    console.log("   - Key: FIREBASE_SERVICE_ACCOUNT");
    console.log("   - Value: [Paste the entire JSON content here]");
    console.log("==================================================================\n");
  } else {
    console.log(`[Firestore Status] Unexpected Firestore warning in ${context}: ${errMsg}`);
  }
}

async function probeFirestore() {
  if (process.env.FORCE_FIRESTORE === "true") {
    console.log("[Firestore Status] FORCE_FIRESTORE is set to 'true'. Bypassing connectivity probe and forcing direct Firestore connection.");
    isFirestoreAvailable = true;
    startRealtimeListener();
    return;
  }
  try {
    console.log("Probing Firestore connectivity...");
    await db.collection("config").doc("probe").get();
    isFirestoreAvailable = true;
    console.log("Firestore API probe succeeded. Firestore is active and usable.");
    startRealtimeListener();
  } catch (err: any) {
    handleFirestoreError(err, "probeFirestore");
  }
}
probeFirestore();


// Helper to make Gemini API calls resilient with exponential backoff & multi-model fallback
async function generateContentWithRetry(ai: any, params: { model: string; contents: any; config?: any }, retries = 3, delayMs = 1000): Promise<any> {
  let attempt = 0;
  // Fall back across highly-available models to guarantee robust, error-free delivery
  const modelsToTry = [params.model, "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  
  for (const currentModel of modelsToTry) {
    for (attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Calling Gemini API using model ${currentModel} (Attempt ${attempt}/${retries})...`);
        const result = await ai.models.generateContent({
          ...params,
          model: currentModel,
        });
        return result;
      } catch (error: any) {
        // Use console.warn to denote non-fatal transient issues and avoid triggering system-level warnings during self-healing
        console.warn(`Gemini API Transient Warning on model ${currentModel} (Attempt ${attempt}/${retries}):`, error.message || error);
        
        // Check if it is a transient error (503, 429, or status UNAVAILABLE)
        const isTransient = 
          error.status === "UNAVAILABLE" || 
          error.status === "RESOURCE_EXHAUSTED" ||
          (error.status === 503) ||
          (error.status === 429) ||
          (error.message && (
            error.message.includes("503") || 
            error.message.includes("429") || 
            error.message.includes("high demand") || 
            error.message.includes("temporary") || 
            error.message.includes("UNAVAILABLE")
          ));
          
        if (isTransient && attempt < retries) {
          const waitTime = delayMs * Math.pow(2, attempt - 1);
          console.log(`Transient error encountered. Retrying in ${waitTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          // Break out of this model's retry loop and try the next fallback model
          break;
        }
      }
    }
  }
  
  throw new Error("All fallback models and retries failed due to high demand or API service unavailability.");
}

const app = express();
app.use(cors());
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

  // API endpoint for explaining questions
  app.post("/api/explain", async (req, res) => {
    const { question, optionSelected, correctAnswer, options, languageName, languageState, explanation, explanationTranslated } = req.body;
    try {
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Secrets.",
        });
      }

      const langName = languageName || "Marathi";
      const langState = languageState || "Maharashtra";

      const prompt = `
You are an expert Automobile Engineering tutor. Explain the following Multiple Choice Question to a student clearly and concisely.
The student wants explanations in a mix of ${langName} and English (bilingual/bilingual ${langName}, as typically understood by engineering students in ${langState}, using English terms for technical words but with ${langName} sentence structure).

Question: ${question}
Options:
${options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join("\n")}

Correct Answer: ${correctAnswer}
Student Selected Option: ${optionSelected || "None (Skipped)"}

Please provide:
1. Direct confirmation (Was the student correct or incorrect?).
2. Detailed explanation of why the correct answer is right (explain the engineering principles/concepts in bilingual ${langName}-English).
3. Why other options are incorrect or in what context they apply (briefly).
4. Translate any very complex technical terms into simple words and give a practical real-world automobile example if applicable.

Keep the tone encouraging, professional, and clear. Format the response nicely using clean Markdown.
`;

      const result = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ explanation: result.text });
    } catch (error: any) {
      console.warn("Gemini API Error in generating explanation, using local standard fallback:", error.message || error);
      
      const standardExp = explanationTranslated || explanation || "This question tests fundamental principles of Automobile Engineering. Please verify your course textbook or syllabus for deep structural details of this assembly.";
      const isMr = languageName?.toLowerCase().includes("marathi") || languageName?.toLowerCase().includes("mr");

      const fallbackText = `
### ⚠️ AI Engine High Demand / तात्पुरती AI लोड मर्यादा
*The AI tutor is currently experiencing very high demand or is temporarily unavailable. Below is the verified standard explanation for this question:*

---

**Correct Answer / बरोबर उत्तर:** ${correctAnswer}
**Your Option / तुमचा पर्याय:** ${optionSelected}

### **Standard Explanation / सविस्तर स्पष्टीकरण:**
${standardExp}

---
*We apologize for the interruption. You can continue taking tests seamlessly.*
`;
      res.json({ explanation: fallbackText, isFallback: true });
    }
  });

  // API endpoint for generating questions dynamically (Endless 1000+ Questions Mode)
  app.post("/api/generate-questions", async (req, res) => {
    const { chapterId, chapterName, count, languageName, languageState } = req.body;
    const countNum = Math.min(25, Math.max(5, parseInt(count) || 10));
    try {
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Secrets.",
        });
      }

      const langName = languageName || "Marathi";
      const langState = languageState || "Maharashtra";

      const prompt = `
You are an elite Automobile Engineering professor and exam designer for Indian technical education boards (like MSBTE, GTU, TNDTE, etc.).
Generate ${countNum} high-quality, textbook-level Multiple Choice Questions (MCQs) for the following chapter:
Chapter ID: ${chapterId === "all" ? "Mixed" : chapterId}
Chapter Name: ${chapterName}

You must write each question in two versions:
1. English (rigorous, technical)
2. Regional Indian Language: ${langName} (used in ${langState}). 
For the ${langName} version, use simple, natural sentence structures but retain standard English terms for complex technical words (e.g. use "clutch", "transmission", "suspension", "brake caliper", "alternator" instead of translating them literally, so it is extremely easy for engineering students to read).

The response MUST be a valid JSON array of objects. Do not include any explanation or markdown formatting outside of the JSON block. Do not wrap it in anything other than the JSON array.

Strict JSON format:
[
  {
    "id": <a unique random positive integer between 1000 and 99999>,
    "chapterId": ${chapterId === "all" ? 1 : chapterId},
    "question": "Question text in English",
    "questionTranslated": "Question text in ${langName}",
    "options": ["Option A in English", "Option B in English", "Option C in English", "Option D in English"],
    "optionsTranslated": ["Option A in ${langName}", "Option B in ${langName}", "Option C in ${langName}", "Option D in ${langName}"],
    "answer": "A", // must be A, B, C, or D
    "explanation": "Clear, informative explanation of why the correct answer is right and others are incorrect, written primarily in ${langName} with English technical terms."
  }
]

Please ensure the questions are rigorous, strictly accurate, cover diverse topics within the chapter, and do not repeat simple introductory facts. Keep the correct answers evenly distributed among A, B, C, and D.
`;

      const result = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = result.text?.trim() || "[]";
      const questions = JSON.parse(responseText);

      res.json({ questions });
    } catch (error: any) {
      console.warn("Gemini API Error in generating questions, using robust local database fallback:", error.message || error);
      
      try {
        // Filter questions by chapter
        let filtered = [...QUESTIONS];
        if (chapterId !== "all") {
          filtered = QUESTIONS.filter((q) => q.chapterId === Number(chapterId));
        }

        // If we don't have enough questions from this chapter, pad with other chapters
        if (filtered.length < countNum) {
          const otherChapters = QUESTIONS.filter((q) => q.chapterId !== Number(chapterId));
          const shuffledOthers = otherChapters.sort(() => 0.5 - Math.random());
          filtered = [...filtered, ...shuffledOthers].slice(0, countNum);
        } else {
          filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, countNum);
        }

        const isMr = languageName?.toLowerCase().includes("marathi") || languageName?.toLowerCase().includes("mr");

        const fallbackQuestions = filtered.map((q) => ({
          id: q.id + 50000 + Math.floor(Math.random() * 10000), // Ensure random unique IDs
          chapterId: q.chapterId,
          question: q.question,
          questionTranslated: isMr ? q.questionMarathi : q.question,
          options: q.options,
          optionsTranslated: isMr ? q.optionsMarathi : q.options,
          answer: q.answer,
          explanation: isMr ? (q.explanationMarathi || q.explanation) : q.explanation
        }));

        console.log(`Successfully generated ${fallbackQuestions.length} fallback questions from local Textbook Bank.`);
        res.json({ questions: fallbackQuestions, isFallback: true });
      } catch (fallbackError: any) {
        console.error("Critical: Fallback generation failed:", fallbackError);
        res.status(500).json({ error: "Failed to generate questions. Standard textbook bank fallback failed." });
      }
    }
  });

  // API endpoint for translating static questions to any Indian language on demand
  app.post("/api/translate-questions", async (req, res) => {
    const { questions, languageName, languageState } = req.body;
    try {
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Client is not configured. Please add GEMINI_API_KEY in Secrets.",
        });
      }

      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "Invalid questions payload" });
      }

      const langName = languageName || "Marathi";
      const langState = languageState || "Maharashtra";

      const prompt = `
You are an expert technical translator. Translate the following list of Automobile Engineering questions into ${langName} (the language of ${langState}, India).
Follow these guidelines carefully:
1. Retain the exact meanings, options, correct answers, and explanations.
2. For each question, provide a translated version of the question, options, and explanation.
3. Keep technical words (like "chassis", "thermostat", "ABS", "alternator", "torque converter", etc.) in English, but write them in simple natural script of ${langName}. The sentence structure must be in ${langName}.
4. Return the result strictly as a JSON array of translated questions matching the input structure. Do not add any markdown blocks or intro/outro text.

Input JSON:
${JSON.stringify(questions.map(q => ({
  id: q.id,
  question: q.question,
  options: q.options,
  explanation: q.explanation
})))}

Output JSON format:
[
  {
    "id": <same id>,
    "questionTranslated": "Translated question text",
    "optionsTranslated": ["Translated option A", "Translated option B", "Translated option C", "Translated option D"],
    "explanationTranslated": "Translated explanation"
  }
]
`;

      const result = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = result.text?.trim() || "[]";
      const translations = JSON.parse(responseText);

      res.json({ translations });
    } catch (error: any) {
      console.warn("Gemini API Error in translating questions, falling back to local bilingual mappings:", error.message || error);
      
      const fallbackTranslations = questions.map(q => ({
        id: q.id,
        questionTranslated: q.questionTranslated || q.questionMarathi || q.question,
        optionsTranslated: q.optionsTranslated || q.optionsMarathi || q.options,
        explanationTranslated: q.explanationTranslated || q.explanationMarathi || q.explanation
      }));
      
      res.json({ translations: fallbackTranslations, isFallback: true });
    }
  });

  // Simple server-side in-memory database of webhook-verified premium users
  // const verifiedPayments = new Map<string, { paymentId: string; timestamp: string }>(); // REMOVED

  // Lazy initialize Razorpay client
  let razorpayInstance: any = null;
  const getRazorpayInstance = () => {
    if (!razorpayInstance) {
      const keyId = process.env.RAZORPAY_KEY_ID?.trim();
      const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
      if (
        !keyId || 
        !keySecret || 
        keyId === "rzp_test_..." || 
        keySecret === "..." || 
        keyId.includes("placeholder") || 
        keyId.startsWith("YOUR_") || 
        keyId.startsWith("your_")
      ) {
        return null;
      }
      try {
        razorpayInstance = new (Razorpay as any)({
          key_id: keyId,
          key_secret: keySecret,
        });
      } catch (e) {
        console.error("Failed to initialize Razorpay SDK:", e);
        return null;
      }
    }
    return razorpayInstance;
  };

  // 1. Create Razorpay Order securely
  app.post("/api/razorpay/create-order", async (req, res) => {
    const { currency, notes } = req.body;
    
    // Fetch dynamic price from firestore config
    let finalAmount = 29900; // default 299 * 100 paise
    if (isFirestoreAvailable) {
      try {
        console.log("Firestore Price Lookup - Attempting to retrieve config document 'config/subscription'...");
        const docRef = db.collection("config").doc("subscription");
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const configData = docSnap.data();
          if (configData && configData.amount) {
            finalAmount = Number(configData.amount) * 100; // Convert Rupees to paise
          }
          console.log(`Firestore Price Lookup - Document found. Amount is ${finalAmount / 100} INR.`);
        } else {
          console.log("Firestore Price Lookup - Document not found. Initializing default subscription config in Firestore.");
          const defaultConfig = {
            amount: 299,
            originalAmount: 999,
            billingPeriod: "lifetime",
            detailsEn: "Automobile Engg. Premium Pack",
            detailsMr: "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
          };
          await docRef.set(defaultConfig);
          finalAmount = 29900;
          console.log("Firestore Price Lookup - Successfully saved default config.");
        }
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, "create-order Price Lookup");
        console.log("Firestore Price Lookup - Falling back to local in-memory config price.");
        finalAmount = memorySubscriptionConfig.amount * 100;
      }
    } else {
      console.log("Firestore Price Lookup - Skipping Firestore (offline mode), using local memory config price.");
      finalAmount = memorySubscriptionConfig.amount * 100;
    }

    try {
      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        console.error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured.");
        return res.status(500).json({ error: "Payment gateway is not configured. Please add Razorpay API keys." });
      }

      const options = {
        amount: finalAmount,
        currency: currency || "INR",
        receipt: `receipt_omto_${Date.now()}`,
        notes: notes || {}
      };

      const order = await razorpay.orders.create(options);
      res.json({
        ...order,
        keyId: process.env.RAZORPAY_KEY_ID,
        isSimulated: false
      });
    } catch (error: any) {
      console.error("Razorpay Order Creation failed:", error);
      res.status(500).json({ error: "Payment gateway error. Please verify your Razorpay API keys." });
    }
  });

  // 2. Handle Razorpay webhook
  app.post("/api/razorpay/webhook", async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "omto_webhook_secret_2026";
    const signature = req.headers["x-razorpay-signature"] as string;

    try {
      if (!signature) {
        return res.status(400).json({ error: "Missing Razorpay Webhook Signature" });
      }

      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest !== signature) {
        console.error("Invalid Webhook Signature!");
        return res.status(403).json({ error: "Webhook signature verification failed" });
      }

      console.log("Razorpay Webhook Signature Verified Successfully!");
      const event = req.body.event;
      
      if (event === "payment.captured") {
        const payment = req.body.payload.payment.entity;
        const notes = payment.notes || {};
        const studentEmail = (notes.email || "").toLowerCase().trim();
        const razorpayPaymentId = payment.id;
        const orderId = payment.order_id;
        
        console.log(`Payment captured for student: ${studentEmail}, Payment ID: ${razorpayPaymentId}`);
        
        if (studentEmail) {
          // Store in local memory map first
          memoryPayments.set(studentEmail, {
            paymentStatus: "Paid",
            paymentId: razorpayPaymentId,
            orderId: orderId,
            signature: signature,
            paidAt: new Date().toISOString()
          });

          if (isFirestoreAvailable) {
            try {
              console.log(`Firestore Payment Webhook - Saving payment record for '${studentEmail}'...`);
              await db.collection("payments").doc(studentEmail).set({
                paymentStatus: "Paid",
                paymentId: razorpayPaymentId,
                orderId: orderId,
                signature: signature,
                paidAt: FieldValue.serverTimestamp(),
              }, { merge: true });
              console.log(`Firestore Payment Webhook - Success: Recorded paid status for: ${studentEmail}`);
            } catch (dbErr: any) {
              handleFirestoreError(dbErr, "Webhook payment.captured");
              console.log(`Firestore Payment Webhook - Fallback: Payment recorded in-memory only.`);
            }
          } else {
            console.log(`Firestore Payment Webhook - Skipping Firestore (offline mode) for '${studentEmail}'.`);
          }
        }
      } else if (event === "payment.failed") {
        const payment = req.body.payload.payment.entity;
        const notes = payment.notes || {};
        const studentEmail = (notes.email || "").toLowerCase().trim();
        
        if (studentEmail) {
          // Store in local memory map first
          memoryPayments.set(studentEmail, {
            paymentStatus: "Failed",
            failedAt: new Date().toISOString()
          });

          if (isFirestoreAvailable) {
            try {
              console.log(`Firestore Payment Webhook - Saving failed payment record for '${studentEmail}'...`);
              await db.collection("payments").doc(studentEmail).set({
                paymentStatus: "Failed",
                failedAt: FieldValue.serverTimestamp(),
              }, { merge: true });
              console.log(`Firestore Payment Webhook - Success: Recorded failure status for: ${studentEmail}`);
            } catch (dbErr: any) {
              handleFirestoreError(dbErr, "Webhook payment.failed");
              console.log(`Firestore Payment Webhook - Fallback: Payment failure recorded in-memory only.`);
            }
          } else {
            console.log(`Firestore Payment Webhook - Skipping Firestore (offline mode) for failed payment of '${studentEmail}'.`);
          }
        }
      }

      res.json({ status: "ok" });
    } catch (error: any) {
      console.error("Razorpay Webhook Processing Error:", error);
      res.status(500).json({ error: error.message || "Webhook processing failed" });
    }
  });

  // 3. Query payment verification status
  app.get("/api/razorpay/verify-payment", async (req, res) => {
    const email = (req.query.email as string || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    try {
      let data: any = null;
      if (isFirestoreAvailable) {
        console.log(`Firestore Payment Verify - Fetching document 'payments/${email}'...`);
        try {
          const doc = await db.collection("payments").doc(email).get();
          if (doc.exists) {
            data = doc.data();
            console.log(`Firestore Payment Verify - Found record in Firestore for ${email}:`, JSON.stringify(data));
          }
        } catch (dbErr: any) {
          handleFirestoreError(dbErr, "verify-payment Fetch");
        }
      } else {
        console.log(`Firestore Payment Verify - Skipping Firestore lookup (offline mode) for ${email}.`);
      }

      if (!data) {
        console.log(`Firestore Payment Verify - Checking in-memory fallback for ${email}...`);
        data = memoryPayments.get(email);
      }

      if (data) {
        return res.json({
          verified: data?.paymentStatus === "Paid",
          paymentStatus: data?.paymentStatus,
          paymentId: data?.paymentId,
          paidAt: data?.paidAt ? (data.paidAt.toDate ? data.paidAt.toDate().toISOString() : data.paidAt) : null
        });
      }

      console.log(`Firestore Payment Verify - No payment record found for: ${email}`);
      res.json({ verified: false, paymentStatus: "Not Found" });
    } catch (error: any) {
      console.error(`Firestore Payment Verify - Failed to verify payment for ${email}:`, error.message || error);
      res.status(500).json({ error: "Failed to verify payment: " + error.message });
    }
  });

  // Automatic signature verification
  app.post("/api/razorpay/verify-signature", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (keySecret && razorpay_signature) {
      try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(body.toString())
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          console.error("Invalid signature. Verification failed.");
          return res.status(400).json({ error: "Invalid signature. Verification failed." });
        }
      } catch (err) {
        console.error("Signature verification error:", err);
        return res.status(500).json({ error: "Internal error verifying signature." });
      }
    }

    const cleanEmail = email.toLowerCase().trim();
    const paymentData = {
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paidAt: new Date().toISOString(),
      verifiedViaSignature: true
    };

    // Store in-memory cache first
    memoryPayments.set(cleanEmail, paymentData);

    // Update user to premium
    const existingUser = memoryUsers.get(cleanEmail) || { email: cleanEmail };
    const updatedUser = {
      ...existingUser,
      isPremium: true,
      subscriptionStatus: "active",
      role: existingUser.role || "student",
      paymentTxnId: razorpay_payment_id,
      paymentDate: new Date().toISOString()
    };
    memoryUsers.set(cleanEmail, updatedUser);

    if (isFirestoreAvailable) {
      try {
        console.log(`Firestore Signature Verify - Writing payment record for '${cleanEmail}'...`);
        await db.collection("payments").doc(cleanEmail).set({
          ...paymentData,
          paidAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // Update student's user profile in Firestore directly
        await db.collection("users").doc(cleanEmail).set({
          isPremium: true,
          subscriptionStatus: "active",
          role: existingUser.role || "student",
          paymentTxnId: razorpay_payment_id,
          paymentDate: new Date().toISOString()
        }, { merge: true });

        console.log(`Firestore Signature Verify - Success: Activated premium via signature verification for: ${cleanEmail}`);
      } catch (err: any) {
        handleFirestoreError(err, "verify-signature Write");
        console.log(`Firestore Signature Verify - Fallback: Payment recorded in-memory only.`);
      }
    } else {
      console.log(`Firestore Signature Verify - Skipping Firestore write (offline mode) for ${cleanEmail}.`);
    }

    broadcastUsers();
    res.json({ success: true, verified: true });
  });

  // 4. Admin force verification
  app.post("/api/razorpay/admin-verify", async (req, res) => {
    const { email, paymentId } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanPaymentId = paymentId || "pay_manual_" + crypto.randomBytes(6).toString("hex");

    const pendingPayment = {
      paymentStatus: "Pending",
      paymentId: cleanPaymentId,
      paidAt: new Date().toISOString(),
      manual: true
    };
    memoryPayments.set(cleanEmail, pendingPayment);

    // Update user to premium
    const existingUserAdmin = memoryUsers.get(cleanEmail) || { email: cleanEmail };
    const updatedUserAdmin = {
      ...existingUserAdmin,
      isPremium: true,
      subscriptionStatus: "active",
      role: existingUserAdmin.role || "student",
      paymentTxnId: cleanPaymentId,
      paymentDate: new Date().toISOString()
    };
    memoryUsers.set(cleanEmail, updatedUserAdmin);

    if (isFirestoreAvailable) {
      try {
        console.log(`Firestore Admin Verify - Writing pending manual payment for '${cleanEmail}'...`);
        await db.collection("payments").doc(cleanEmail).set({
          paymentStatus: "Pending",
          paymentId: cleanPaymentId,
          paidAt: FieldValue.serverTimestamp(),
          manual: true
        }, { merge: true });

        // Update student's user profile in Firestore directly
        await db.collection("users").doc(cleanEmail).set({
          isPremium: true,
          subscriptionStatus: "active",
          role: existingUserAdmin.role || "student",
          paymentTxnId: cleanPaymentId,
          paymentDate: new Date().toISOString()
        }, { merge: true });

        console.log(`Firestore Admin Verify - Success: Recorded pending manual payment in Firestore for: ${cleanEmail}`);
      } catch (error: any) {
        handleFirestoreError(error, "admin-verify Write");
        console.log(`Firestore Admin Verify - Fallback: Recorded pending manual payment in-memory only.`);
      }
    } else {
      console.log(`Firestore Admin Verify - Skipping Firestore write (offline mode) for manual payment of ${cleanEmail}.`);
    }
    broadcastUsers();
    res.json({ success: true, pending: true, email: cleanEmail, paymentId: cleanPaymentId });
  });

  // 5. Get current subscription config (price, discount, description)
  app.get("/api/subscription/config", async (req, res) => {
    if (isFirestoreAvailable) {
      try {
        console.log("Firestore Config Get - Fetching subscription config from Firestore...");
        const docRef = db.collection("config").doc("subscription");
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const configData = docSnap.data();
          console.log("Firestore Config Get - Success: Retrieved subscription config:", JSON.stringify(configData));
          if (configData) {
            memorySubscriptionConfig = {
              amount: Number(configData.amount) || 299,
              originalAmount: Number(configData.originalAmount) || 999,
              billingPeriod: configData.billingPeriod || "lifetime",
              detailsEn: configData.detailsEn || "Automobile Engg. Premium Pack",
              detailsMr: configData.detailsMr || "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
            };
          }
          return res.json(configData);
        }
        
        // Default initial config if not exists
        const defaultConfig = {
          amount: 299,
          originalAmount: 999,
          billingPeriod: "lifetime",
          detailsEn: "Automobile Engg. Premium Pack",
          detailsMr: "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
        };
        console.log("Firestore Config Get - Config document not found. Initializing defaults in Firestore...");
        await docRef.set(defaultConfig);
        console.log("Firestore Config Get - Success: Wrote default subscription config to Firestore.");
        return res.json(defaultConfig);
      } catch (error: any) {
        handleFirestoreError(error, "subscription/config GET");
        console.log("Firestore Config Get - Falling back to local in-memory config.");
        return res.json(memorySubscriptionConfig);
      }
    } else {
      console.log("Firestore Config Get - Skipping Firestore lookup (offline mode), returning local memory config.");
      return res.json(memorySubscriptionConfig);
    }
  });

  // 6. Update subscription config (Admin only)
  app.post("/api/subscription/config", async (req, res) => {
    const { amount, originalAmount, billingPeriod, detailsEn, detailsMr } = req.body;
    const updatedConfig = {
      amount: Number(amount) || 299,
      originalAmount: Number(originalAmount) || 999,
      billingPeriod: billingPeriod || "lifetime",
      detailsEn: detailsEn || "Automobile Engg. Premium Pack",
      detailsMr: detailsMr || "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
    };

    // Keep memory cache updated
    memorySubscriptionConfig = updatedConfig;

    if (isFirestoreAvailable) {
      try {
        console.log("Firestore Config Update - Writing updated subscription config to Firestore...");
        const docRef = db.collection("config").doc("subscription");
        await docRef.set(updatedConfig, { merge: true });
        console.log("Firestore Config Update - Success: Updated subscription plan in Firestore:", JSON.stringify(updatedConfig));
      } catch (error: any) {
        handleFirestoreError(error, "subscription/config POST");
        console.log("Firestore Config Update - Stored config in-memory only.");
      }
    } else {
      console.log("Firestore Config Update - Skipping Firestore write (offline mode), stored in-memory only.");
    }
    return res.json({ success: true, config: updatedConfig });
  });

  // Bypass Code implementation and dynamic loading
  let activeBypassCode = "OMTOADMIN";

  async function loadBypassCode() {
    if (isFirestoreAvailable) {
      try {
        const docSnap = await db.collection("config").doc("security").get();
        if (docSnap.exists) {
          const secData = docSnap.data();
          if (secData && secData.bypassCode) {
            activeBypassCode = secData.bypassCode;
          }
        }
      } catch (e) {
        handleFirestoreError(e, "loadBypassCode");
      }
    }
  }

  // Load bypass code on startup
  loadBypassCode();

  app.get("/api/admin/bypass-code", async (req, res) => {
    await loadBypassCode();
    res.json({ success: true, bypassCode: activeBypassCode });
  });

  app.post("/api/admin/bypass-code", async (req, res) => {
    const { bypassCode } = req.body;
    if (!bypassCode) {
      return res.status(400).json({ error: "Bypass code is required" });
    }
    const cleanBypass = bypassCode.trim().toUpperCase();
    activeBypassCode = cleanBypass;

    if (isFirestoreAvailable) {
      try {
        await db.collection("config").doc("security").set({ bypassCode: cleanBypass }, { merge: true });
        console.log(`Firestore - Updated bypassCode to '${cleanBypass}' in config/security`);
      } catch (err: any) {
        handleFirestoreError(err, "security config POST");
      }
    }
    res.json({ success: true });
  });

  // Coupons implementation
  let memoryCoupons = [
    { id: "1", code: "", discountPercent: 10, isActive: false },
    { id: "2", code: "", discountPercent: 20, isActive: false },
    { id: "3", code: "", discountPercent: 30, isActive: false },
    { id: "4", code: "", discountPercent: 40, isActive: false },
    { id: "5", code: "", discountPercent: 50, isActive: false }
  ];

  async function loadCoupons() {
    if (isFirestoreAvailable) {
      try {
        const docSnap = await db.collection("config").doc("coupons").get();
        if (docSnap.exists) {
          const data = docSnap.data();
          if (data && data.coupons && Array.isArray(data.coupons)) {
            memoryCoupons = data.coupons;
          }
        }
      } catch (e) {
        handleFirestoreError(e, "loadCoupons");
      }
    }
  }
  loadCoupons();

  app.get("/api/coupons", async (req, res) => {
    await loadCoupons();
    res.json({ success: true, coupons: memoryCoupons });
  });

  app.post("/api/admin/coupons", async (req, res) => {
    const { coupons } = req.body;
    if (!coupons || !Array.isArray(coupons)) {
      return res.status(400).json({ error: "Invalid coupons payload" });
    }
    
    // Strict validation of each coupon
    for (const c of coupons) {
        if (typeof c.code !== 'string' || 
            typeof c.discountPercent !== 'number' || 
            c.discountPercent < 0 || c.discountPercent > 100 ||
            typeof c.isActive !== 'boolean') {
            return res.status(400).json({ error: "Invalid coupon structure or values" });
        }
    }
    
    memoryCoupons = coupons;
    if (isFirestoreAvailable) {
      try {
        await db.collection("config").doc("coupons").set({ coupons }, { merge: true });
      } catch (err: any) {
        handleFirestoreError(err, "coupons config POST");
      }
    }
    res.json({ success: true, coupons: memoryCoupons });
  });

  app.post("/api/coupons/validate", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });
    
    await loadCoupons();
    const coupon = memoryCoupons.find(c => c.isActive && c.code.toUpperCase() === code.toUpperCase().trim());
    
    if (coupon) {
      res.json({ success: true, valid: true, discountPercent: coupon.discountPercent });
    } else {
      res.json({ success: true, valid: false, error: "Invalid or expired coupon code" });
    }
  });

  // Security Email Alert Helper when Admin Bypass Code is used
  const ALLOWED_ADMIN_EMAILS = [
    "jemshery17@gmail.com",
    "javedsayyad93@gmail.com",
    "javedsayyad9394@gmail.com"
  ];

  async function sendBypassAlertEmail(usedIdentifier: string, method: string) {
    const cleanId = usedIdentifier.toLowerCase().trim();
    // Primary user/developer emails, do not alert for them
    if (ALLOWED_ADMIN_EMAILS.includes(cleanId)) {
      console.log(`[Bypass Alert] Primary admin/developer logged in (${cleanId}). Skipping alert email.`);
      return;
    }

    if (transporter) {
      try {
        const formattedTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || '"OMTO Admin Guard" <noreply@example.com>',
          to: "jemshery17@gmail.com, javedsayyad93@gmail.com, javedsayyad9394@gmail.com",
          subject: "⚠️ SECURITY ALERT: Admin Bypass Login Detected!",
          text: `Security Alert:\n\nSomeone logged into OMTO using an Admin Bypass Password.\n\nDetails:\n- Email/Username: ${usedIdentifier}\n- Method: ${method}\n- Time: ${formattedTime} (IST)\n\nIf this wasn't you, please change the Admin Bypass Code from the Admin Panel immediately.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #ef4444; border-radius: 12px; background-color: #fef2f2; color: #1f2937;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 48px;">⚠️</span>
                <h2 style="color: #991b1b; margin-top: 10px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 5px;">Security Alert: Bypass Login Detected</h2>
                <p style="color: #ef4444; font-size: 13px; font-weight: bold; margin: 0;">UNAUTHORIZED ACCESS PREVENTION</p>
              </div>
              
              <p style="color: #374151; font-size: 15px; line-height: 1.5; margin-top: 0;">
                Hello Admin,
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.5;">
                This is an automated security notification. An <strong>Admin Bypass Password</strong> was used to log in to the application by someone other than your primary email address.
              </p>
              
              <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #fee2e2; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600; width: 140px;">Identifier Used:</td>
                    <td style="padding: 6px 0; color: #111827; font-weight: bold; font-family: monospace;">${usedIdentifier}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Login Method:</td>
                    <td style="padding: 6px 0; color: #111827;">${method}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Time:</td>
                    <td style="padding: 6px 0; color: #111827;">${formattedTime} IST</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #991b1b; font-size: 14px; font-weight: 700; margin-bottom: 20px;">
                If this was not you, please open the Admin Panel and change the Bypass Code immediately to secure the system.
              </p>
              
              <hr style="border: none; border-top: 1px solid #fca5a5; margin: 20px 0;" />
              <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
                OMTO Security Shield Active • Protected Session Monitoring
              </p>
            </div>
          `,
        });
        console.log(`[Bypass Alert] Alert email successfully sent to admins for login by ${usedIdentifier}`);
      } catch (err) {
        console.error("[Bypass Alert] Failed to send security alert email:", err);
      }
    } else {
      console.warn(`[Bypass Alert] SMTP not configured. Alert email would have been sent to admins. Identifier: ${usedIdentifier}, Method: ${method}`);
    }
  }

  // Admin forgot password OTP memory store
  const adminBypassOtps = new Map<string, { otp: string; expiresAt: number }>();

  app.post("/api/admin/forgot-bypass/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      return res.status(403).json({ error: "Unauthorized email address. Access denied." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    adminBypassOtps.set(cleanEmail, { otp, expiresAt });
    console.log(`[ADMIN BYPASS OTP] Generated OTP ${otp} for ${cleanEmail}`);

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || '"OMTO Admin Guard" <noreply@example.com>',
          to: cleanEmail,
          subject: "🔐 Admin Bypass OTP - OMTO Security",
          text: `Your Admin Bypass login OTP is: ${otp}. This is valid for 10 minutes.`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
              <h2 style="color: #0f172a; text-align: center; margin-bottom: 20px;">Admin Bypass OTP</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">You requested an OTP to log in to OMTO as Admin.</p>
              <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; font-family: monospace;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; text-align: center;">This OTP is valid for 10 minutes. If you did not request this, please change your bypass code immediately.</p>
            </div>
          `
        });
        console.log(`[Admin Bypass Alert] Sent OTP to ${cleanEmail}`);
        return res.json({ success: true });
      } catch (err: any) {
        console.error("Failed to send Admin Bypass OTP email:", err);
        return res.status(500).json({ error: "Failed to send email. Check SMTP settings." });
      }
    } else {
      return res.json({ success: true, mock: true, otp });
    }
  });

  app.post("/api/admin/forgot-bypass/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      return res.status(403).json({ error: "Unauthorized email address." });
    }

    const record = adminBypassOtps.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ error: "OTP not requested or expired." });
    }

    if (Date.now() > record.expiresAt) {
      adminBypassOtps.delete(cleanEmail);
      return res.status(400).json({ error: "OTP expired." });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // Success! Log them in
    adminBypassOtps.delete(cleanEmail);

    const adminUser = {
      email: cleanEmail,
      username: cleanEmail.split("@")[0],
      isPremium: true,
      role: "admin",
      subscriptionStatus: "active"
    };

    console.log(`[Bypass Auth] Logged in admin '${cleanEmail}' using Forgot-Bypass OTP.`);
    // Send email alert asynchronously
    sendBypassAlertEmail(cleanEmail, "Admin Forgot Bypass OTP Verification");

    return res.json({ success: true, user: adminUser });
  });

  // Endpoint to notify about frontend-based bypass logins
  app.post("/api/admin/notify-bypass", async (req, res) => {
    const { identifier, method } = req.body;
    const cleanId = identifier ? identifier.trim() : "Unknown User";
    const cleanMethod = method ? method.trim() : "Secret Double-Click Prompt";
    
    // Trigger alert email asynchronously
    sendBypassAlertEmail(cleanId, cleanMethod);
    
    return res.json({ success: true });
  });

  // OTP Verification logic
  const memoryOtps = new Map<string, { otp: string, expiresAt: number, attempts: number }>();

  app.post("/api/otp/send", async (req, res) => {
    const { contact } = req.body;
    if (!contact) {
      return res.status(400).json({ error: "Contact (email or phone) is required" });
    }

    const cleanContact = contact.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanContact)) {
      return res.status(400).json({ error: "Invalid email format. Please provide a valid email ID." });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    memoryOtps.set(cleanContact, { otp, expiresAt, attempts: 0 });
    
    console.log(`[OTP GENERATED] OTP for ${cleanContact} is ${otp}`);

    // If it's an email address, try to send real email
    const isEmail = cleanContact.includes("@");
    if (isEmail && transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER || '"Auto Mock Test" <noreply@example.com>',
          to: cleanContact,
          subject: "Your OTP for Registration",
          text: `Your OTP for registration is: ${otp}. It is valid for 10 minutes.`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #333; text-align: center;">Registration OTP</h2>
              <p>Hello,</p>
              <p>Your One-Time Password (OTP) for registration is:</p>
              <h1 style="text-align: center; font-size: 36px; letter-spacing: 4px; color: #f59e0b; background-color: #fffbeb; padding: 10px; border-radius: 8px; border: 1px dashed #f59e0b;">${otp}</h1>
              <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
        console.log(`Email sent successfully to ${cleanContact}`);
      } catch (error) {
        console.error(`Failed to send email to ${cleanContact}:`, error);
      }
    }

    res.json({ success: true, message: "OTP sent successfully" });
  });

  app.post("/api/otp/verify", async (req, res) => {
    const { contact, otp } = req.body;
    if (!contact || !otp) {
      return res.status(400).json({ error: "Contact and OTP are required" });
    }

    const cleanContact = contact.toLowerCase().trim();
    const storedOtpData = memoryOtps.get(cleanContact);

    if (!storedOtpData) {
      return res.status(400).json({ error: "No OTP requested for this contact" });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      memoryOtps.delete(cleanContact);
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (storedOtpData.attempts >= 5) {
      memoryOtps.delete(cleanContact);
      return res.status(400).json({ error: "Too many failed attempts. Please request a new OTP." });
    }

    if (storedOtpData.otp !== otp) {
      storedOtpData.attempts += 1;
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    // OTP is valid
    memoryOtps.delete(cleanContact);
    res.json({ success: true, message: "OTP verified successfully" });
  });

  // --- Admin User Management Endpoints ---
  app.get("/api/users/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Initial load push
    const now = Date.now();
    let usersList = Array.from(memoryUsers.values());
    usersList = usersList.map(u => {
      const email = typeof u.email === "string" ? u.email.toLowerCase().trim() : "";
      const isOnline = email ? (onlineUsers.has(email) && (now - onlineUsers.get(email)! < 5 * 60 * 1000)) : false;
      return {
        ...u,
        isOnline
      };
    });
    usersList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.write(`data: ${JSON.stringify({ success: true, users: usersList })}\n\n`);

    sseClients.push(res);

    req.on("close", () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  app.post("/api/users/heartbeat", (req, res) => {
    const { email } = req.body;
    if (email) {
      onlineUsers.set(email.toLowerCase().trim(), Date.now());
      broadcastUsers();
    }
    res.json({ success: true });
  });

  // --- Auth APIs ---
  app.post("/api/auth/login", async (req, res) => {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const searchKey = emailOrUsername.trim().toLowerCase();

    try {
      // Dynamic Admin Bypass Code authentication check
      if (password === activeBypassCode) {
        const cleanUserEmail = searchKey.includes("@") ? searchKey : `${searchKey}@omto.com`;
        const responseUser = {
          email: cleanUserEmail,
          username: searchKey.split("@")[0],
          isPremium: true,
          role: "admin",
          subscriptionStatus: "active"
        };
        console.log(`[Bypass Auth] Logged in admin '${cleanUserEmail}' using bypass code.`);
        // Trigger security alert email asynchronously
        sendBypassAlertEmail(cleanUserEmail, "Normal Login Form (Backend Bypass)");
        return res.json({ success: true, user: responseUser });
      }

      let userDoc: any = null;
      if (isFirestoreAvailable) {
        if (searchKey.includes("@")) {
          const docRef = db.collection("users").doc(searchKey);
          const snapshot = await docRef.get();
          if (snapshot.exists) {
            userDoc = snapshot.data();
          }
        } else {
          const snapshot = await db.collection("users").where("username", "==", emailOrUsername.trim()).get();
          if (!snapshot.empty) {
            userDoc = snapshot.docs[0].data();
          }
        }
      }

      // If Firestore lookup failed or returned nothing, fall back to memory
      if (!userDoc) {
        if (searchKey.includes("@")) {
          userDoc = memoryUsers.get(searchKey);
        } else {
          userDoc = Array.from(memoryUsers.values()).find(
            (u: any) => u.username && u.username.toLowerCase().trim() === searchKey
          );
        }
      }

      if (!userDoc) {
        return res.status(400).json({ error: "User not found" });
      }

      if (userDoc.password !== password) {
        return res.status(400).json({ error: "Incorrect password" });
      }

      if (userDoc.isBlocked) {
        return res.status(403).json({ error: "Your account is blocked by administrator." });
      }

      const sessionToken = crypto.randomUUID();
      if (isFirestoreAvailable) {
        await db.collection("users").doc(userDoc.email).update({ sessionToken });
      }

      const responseUser = {
        email: userDoc.email,
        username: userDoc.username,
        isPremium: userDoc.isPremium || false,
        role: userDoc.role || "student",
        subscriptionStatus: userDoc.subscriptionStatus || (userDoc.isPremium ? "active" : "inactive"),
        sessionToken: sessionToken
      };

      // Ensure local memory cache is updated
      memoryUsers.set(responseUser.email.toLowerCase().trim(), {
        ...userDoc,
        ...responseUser
      });

      res.json({ success: true, user: responseUser });
    } catch (e: any) {
      console.error("Login API error:", e);
      res.status(500).json({ error: e.message || "Login failed" });
    }
  });

  app.post("/api/auth/signup-check", async (req, res) => {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ error: "Missing email or username" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Invalid email address format." });
    }

    try {
      let emailExists = false;
      let usernameExists = false;

      if (isFirestoreAvailable) {
        const emailSnap = await db.collection("users").doc(cleanEmail).get();
        if (emailSnap.exists) emailExists = true;

        const userQuery = await db.collection("users").where("username", "==", username.trim()).get();
        if (!userQuery.empty) usernameExists = true;
      } else {
        const existingEmail = memoryUsers.get(cleanEmail);
        if (existingEmail) emailExists = true;

        usernameExists = Array.from(memoryUsers.values()).some(
          (u: any) => u.username && u.username.toLowerCase().trim() === cleanUsername
        );
      }

      if (emailExists) {
        return res.status(400).json({ error: "Email is already registered" });
      }
      if (usernameExists) {
        return res.status(400).json({ error: "Username is already taken" });
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Validation failed" });
    }
  });

  app.post("/api/auth/signup-complete", async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const newUser = {
      email: cleanEmail,
      username: username.trim(),
      password: password,
      isPremium: false,
      role: "student",
      subscriptionStatus: "inactive",
      createdAt: new Date().toISOString()
    };

    try {
      if (isFirestoreAvailable) {
        await db.collection("users").doc(cleanEmail).set(newUser, { merge: true });
      }
      memoryUsers.set(cleanEmail, newUser);
      broadcastUsers();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to create user" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { emailOrUsername } = req.body;
    if (!emailOrUsername) {
      return res.status(400).json({ error: "Missing email or username" });
    }
    const searchKey = emailOrUsername.trim().toLowerCase();

    try {
      let userDoc: any = null;
      if (isFirestoreAvailable) {
        if (searchKey.includes("@")) {
          const docSnap = await db.collection("users").doc(searchKey).get();
          if (docSnap.exists) userDoc = docSnap.data();
        } else {
          const query = await db.collection("users").where("username", "==", emailOrUsername.trim()).get();
          if (!query.empty) userDoc = query.docs[0].data();
        }
      }

      if (!userDoc) {
        if (searchKey.includes("@")) {
          userDoc = memoryUsers.get(searchKey);
        } else {
          userDoc = Array.from(memoryUsers.values()).find(
            (u: any) => u.username && u.username.toLowerCase().trim() === searchKey
          );
        }
      }

      if (!userDoc) {
        return res.status(404).json({ error: "Account not found" });
      }

      res.json({ success: true, username: userDoc.username, email: userDoc.email, password: userDoc.password });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isFirestoreAvailable) {
        await db.collection("users").doc(cleanEmail).update({ password });
      }
      const existing = memoryUsers.get(cleanEmail) || { email: cleanEmail };
      memoryUsers.set(cleanEmail, { ...existing, password });
      broadcastUsers();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/forgot-username", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }
    const cleanEmail = email.trim().toLowerCase();

    try {
      let userDoc: any = null;
      if (isFirestoreAvailable) {
        const docSnap = await db.collection("users").doc(cleanEmail).get();
        if (docSnap.exists) userDoc = docSnap.data();
      }

      if (!userDoc) {
        userDoc = memoryUsers.get(cleanEmail);
      }

      if (!userDoc) {
        return res.status(404).json({ error: "Account not found" });
      }

      res.json({ success: true, username: userDoc.username });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Quiz Attempt APIs ---
  app.post("/api/users/attempts", async (req, res) => {
    const { email, attempt } = req.body;
    if (!email || !attempt) {
      return res.status(400).json({ error: "Missing email or attempt" });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (isFirestoreAvailable) {
      try {
        await db.collection("users").doc(cleanEmail).collection("attempts").doc(attempt.id).set(attempt);
        res.json({ success: true });
      } catch (e: any) {
        handleFirestoreError(e, "POST /api/users/attempts");
        res.status(500).json({ error: "Failed to save attempt to Firestore" });
      }
    } else {
      const userAttempts = memoryAttempts.get(cleanEmail) || [];
      userAttempts.push(attempt);
      memoryAttempts.set(cleanEmail, userAttempts);
      res.json({ success: true });
    }
  });

  app.get("/api/users/attempts", async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Missing email query parameter" });
    }
    const cleanEmail = (email as string).toLowerCase().trim();
    let attemptsList: any[] = [];
    if (isFirestoreAvailable) {
      try {
        const snapshot = await db.collection("users").doc(cleanEmail).collection("attempts").get();
        snapshot.forEach(doc => {
          attemptsList.push(doc.data());
        });
        res.json({ success: true, attempts: attemptsList });
      } catch (e: any) {
        handleFirestoreError(e, "GET /api/users/attempts");
        res.status(500).json({ error: "Failed to get attempts from Firestore" });
      }
    } else {
      attemptsList = memoryAttempts.get(cleanEmail) || [];
      res.json({ success: true, attempts: attemptsList });
    }
  });

  app.delete("/api/users/attempts", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (isFirestoreAvailable) {
      try {
        const ref = db.collection("users").doc(cleanEmail).collection("attempts");
        const snapshot = await ref.get();
        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        res.json({ success: true });
      } catch (e: any) {
        handleFirestoreError(e, "DELETE /api/users/attempts");
        res.status(500).json({ error: "Failed to clear attempts in Firestore" });
      }
    } else {
      memoryAttempts.delete(cleanEmail);
      res.json({ success: true });
    }
  });

  app.get("/api/users/profile", async (req, res) => {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    let user = memoryUsers.get(cleanEmail);
    if (!user && isFirestoreAvailable) {
      try {
        const doc = await db.collection("users").doc(cleanEmail).get();
        if (doc.exists) {
          user = doc.data();
          memoryUsers.set(cleanEmail, user);
        }
      } catch (err) {
        handleFirestoreError(err, "GET /api/users/profile");
      }
    }
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/users/sync", async (req, res) => {
    const { user } = req.body;
    console.log("POST /api/users/sync - payload:", JSON.stringify(req.body));
    if (!user || !user.email) {
      console.error("POST /api/users/sync - Error: invalid user or missing email");
      return res.status(400).json({ error: "Invalid user data" });
    }
    const email = user.email.toLowerCase().trim();
    
    // Auto-set created date if not exists
    if (!user.createdAt) user.createdAt = new Date().toISOString();
    
    onlineUsers.set(email, Date.now());

    // Save locally first for in-memory resilience
    const existing = memoryUsers.get(email) || {};
    
    // Safety check: protect premium, subscription, and role fields from client-side reset
    const preserves: any = {};
    if (existing.isPremium !== undefined) preserves.isPremium = existing.isPremium;
    if (existing.subscriptionStatus !== undefined) preserves.subscriptionStatus = existing.subscriptionStatus;
    if (existing.role !== undefined) preserves.role = existing.role;
    if (existing.expiryDate !== undefined) preserves.expiryDate = existing.expiryDate;
    if (existing.isBlocked !== undefined) preserves.isBlocked = existing.isBlocked;
    if (existing.password !== undefined) preserves.password = existing.password;

    const updated = { ...existing, ...user, ...preserves };
    memoryUsers.set(email, updated);
    
    if (isFirestoreAvailable) {
      try {
        console.log(`Firestore Sync - Attempting to write user '${email}' to collection 'users'...`);
        // Filter out undefined values to prevent Firestore serialization errors
        const cleanedUser = JSON.parse(JSON.stringify(updated));
        await db.collection("users").doc(email).set(cleanedUser, { merge: true });
        console.log(`Firestore Sync - Success: Saved user '${email}' to collection 'users'.`);
      } catch(e: any) {
        handleFirestoreError(e, "users/sync POST");
        console.log(`Firestore Sync - Fallback: Saved user '${email}' to local memory cache.`);
      }
    } else {
      console.log(`Firestore Sync - Skipping Firestore write (offline mode) for user '${email}'.`);
    }
    broadcastUsers();
    res.json({ success: true, user: updated });
  });

  app.get("/api/users", async (req, res) => {
    let usersList: any[] = [];
    let success = false;
    if (isFirestoreAvailable) {
      console.log("GET /api/users - Fetching all users from Firestore...");
      try {
        console.log("Firestore Get - Fetching from collection 'users'...");
        const snapshot = await db.collection("users").get();
        snapshot.forEach(doc => usersList.push(doc.data()));
        console.log(`Firestore Get - Success: Fetched ${usersList.length} users from Firestore.`);
        success = true;

        // Sync local in-memory cache with what we retrieved
        usersList.forEach(u => {
          if (u.email) {
            const cleanEmail = u.email.toLowerCase().trim();
            memoryUsers.set(cleanEmail, { ...memoryUsers.get(cleanEmail), ...u });
          }
        });
      } catch(e: any) {
        handleFirestoreError(e, "GET /api/users");
      }
    } else {
      console.log("GET /api/users - Skipping Firestore fetch (offline mode).");
    }

    if (!success) {
      console.log("GET /api/users - Falling back to local in-memory user cache...");
      usersList = Array.from(memoryUsers.values());
    }
    
    const now = Date.now();
    usersList = usersList.map(u => {
      const email = typeof u.email === "string" ? u.email.toLowerCase().trim() : "";
      const isOnline = email ? (onlineUsers.has(email) && (now - onlineUsers.get(email)! < 5 * 60 * 1000)) : false;
      return {
        ...u,
        isOnline
      };
    });
    
    // Sort so newest are first
    usersList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    console.log(`GET /api/users - Returning ${usersList.length} total users.`);
    res.json({ success: true, users: usersList });
  });

  app.post("/api/users/update", async (req, res) => {
    const { email, updates } = req.body;
    console.log(`POST /api/users/update - email: '${email}', updates:`, JSON.stringify(updates));
    if (!email) {
      console.error("POST /api/users/update - Error: email is required.");
      return res.status(400).json({ error: "Email required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    
    // Save to local map
    const existing = memoryUsers.get(cleanEmail) || { email: cleanEmail };
    const updated = { ...existing, ...updates };
    memoryUsers.set(cleanEmail, updated);
    
    if (isFirestoreAvailable) {
      try {
        console.log(`Firestore Update - Modifying document 'users/${cleanEmail}'...`);
        const cleanedUpdates = JSON.parse(JSON.stringify(updates));
        await db.collection("users").doc(cleanEmail).set(cleanedUpdates, { merge: true });
        console.log(`Firestore Update - Success: Updated document 'users/${cleanEmail}'.`);
      } catch(e: any) {
        handleFirestoreError(e, "users/update POST");
        console.log(`Firestore Update - Fallback: Updated user in local memory cache.`);
      }
    } else {
      console.log(`Firestore Update - Skipping Firestore write (offline mode) for user '${cleanEmail}'.`);
    }
    broadcastUsers();
    res.json({ success: true });
  });

  app.delete("/api/users/:email", async (req, res) => {
    const email = req.params.email.toLowerCase().trim();
    console.log(`DELETE /api/users/${email} - Attempting removal...`);
    
    // Delete from local maps
    memoryUsers.delete(email);
    onlineUsers.delete(email);

    if (isFirestoreAvailable) {
      try {
        console.log(`Firestore Delete - Removing document 'users/${email}'...`);
        await db.collection("users").doc(email).delete();
        console.log(`Firestore Delete - Success: Deleted document 'users/${email}'.`);
      } catch (e: any) {
        handleFirestoreError(e, `users/:email DELETE for ${email}`);
        console.log(`Firestore Delete - Fallback: Deleted user from local memory cache.`);
      }
    } else {
      console.log(`Firestore Delete - Skipping Firestore delete (offline mode) for user '${email}'.`);
    }
    broadcastUsers();
    res.json({ success: true });
  });
  // --------------------------------------

  // Serve static questions data from backend if needed
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", geminiConfigured: !!ai });
  });

  // Vite middleware for development (Skip in Vercel)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    import("vite").then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      }).then((vite) => {
        app.use(vite.middlewares);
        app.listen(PORT, "0.0.0.0", () => {
          console.log(`Server running on http://localhost:${PORT}`);
        });
      });
    }).catch(err => console.error("Failed to load vite", err));
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

export default app;
