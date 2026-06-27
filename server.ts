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
const memoryPayments = new Map<string, any>();
let memorySubscriptionConfig = {
  amount: 299,
  originalAmount: 999,
  billingPeriod: "lifetime",
  detailsEn: "Automobile Engg. Premium Pack",
  detailsMr: "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
};

let isFirestoreAvailable = true;

function handleFirestoreError(err: any, context: string) {
  const errMsg = err?.message || String(err);
  const isPermissionOrNotFound = 
    errMsg.includes("PERMISSION_DENIED") || 
    errMsg.includes("NOT_FOUND") || 
    errMsg.includes("Cloud Firestore API") || 
    errMsg.includes("disabled") ||
    errMsg.includes("not found");

  if (isPermissionOrNotFound) {
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
  try {
    console.log("Probing Firestore connectivity...");
    await db.collection("config").doc("probe").get();
    isFirestoreAvailable = true;
    console.log("Firestore API probe succeeded. Firestore is active and usable.");
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

    if (isFirestoreAvailable) {
      try {
        console.log(`Firestore Signature Verify - Writing payment record for '${cleanEmail}'...`);
        await db.collection("payments").doc(cleanEmail).set({
          ...paymentData,
          paidAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`Firestore Signature Verify - Success: Activated premium via signature verification for: ${cleanEmail}`);
      } catch (err: any) {
        handleFirestoreError(err, "verify-signature Write");
        console.log(`Firestore Signature Verify - Fallback: Payment recorded in-memory only.`);
      }
    } else {
      console.log(`Firestore Signature Verify - Skipping Firestore write (offline mode) for ${cleanEmail}.`);
    }

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

    if (isFirestoreAvailable) {
      try {
        console.log(`Firestore Admin Verify - Writing pending manual payment for '${cleanEmail}'...`);
        await db.collection("payments").doc(cleanEmail).set({
          paymentStatus: "Pending",
          paymentId: cleanPaymentId,
          paidAt: FieldValue.serverTimestamp(),
          manual: true
        }, { merge: true });
        console.log(`Firestore Admin Verify - Success: Recorded pending manual payment in Firestore for: ${cleanEmail}`);
      } catch (error: any) {
        handleFirestoreError(error, "admin-verify Write");
        console.log(`Firestore Admin Verify - Fallback: Recorded pending manual payment in-memory only.`);
      }
    } else {
      console.log(`Firestore Admin Verify - Skipping Firestore write (offline mode) for manual payment of ${cleanEmail}.`);
    }
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

  // OTP Verification logic
  const memoryOtps = new Map<string, { otp: string, expiresAt: number, attempts: number }>();

  app.post("/api/otp/send", async (req, res) => {
    const { contact } = req.body;
    if (!contact) {
      return res.status(400).json({ error: "Contact (email or phone) is required" });
    }

    const cleanContact = contact.toLowerCase().trim();
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
  const onlineUsers = new Map<string, number>();

  app.post("/api/users/heartbeat", (req, res) => {
    const { email } = req.body;
    if (email) {
      onlineUsers.set(email.toLowerCase().trim(), Date.now());
    }
    res.json({ success: true });
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
    const updated = { ...existing, ...user };
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
    res.json({ success: true });
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
    usersList = usersList.map(u => ({
      ...u,
      isOnline: onlineUsers.has(u.email.toLowerCase().trim()) && (now - onlineUsers.get(u.email.toLowerCase().trim())! < 5 * 60 * 1000)
    }));
    
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
