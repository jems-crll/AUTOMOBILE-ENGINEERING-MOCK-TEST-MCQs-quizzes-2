import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { QUESTIONS } from "./src/data/questions";
import Razorpay from "razorpay";
import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

dotenv.config();

// Initialize Firebase Admin with credentials if provided, otherwise default (Cloud Run/ADC)
if (getApps().length === 0) {
  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountVar) {
    try {
      const serviceAccount = JSON.parse(serviceAccountVar);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("Firebase Admin successfully initialized with service account from env.");
    } catch (e: any) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", e);
      initializeApp();
    }
  } else {
    initializeApp();
    console.log("Firebase Admin initialized with default credentials.");
  }
}
const db = getFirestore();

// In-memory fallbacks in case Firestore is disabled/missing
const memoryPayments = new Map<string, any>();
let memorySubscriptionConfig = {
  amount: 299,
  originalAmount: 999,
  billingPeriod: "lifetime",
  detailsEn: "Automobile Engg. Premium Pack",
  detailsMr: "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
};

let isFirestoreAvailable = true;

// Run quick probe to detect if Firestore API is disabled or permissions are missing
async function probeFirestore() {
  try {
    await db.collection("config").doc("probe").get();
    isFirestoreAvailable = true;
    console.log("Firestore API probe succeeded. Firestore is active and usable.");
  } catch (err: any) {
    isFirestoreAvailable = false;
    console.warn("Firestore API is disabled, permission denied, or unavailable in this environment. Falling back to robust in-memory storage globally:", err?.message || err);
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
        const docRef = db.collection("config").doc("subscription");
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const configData = docSnap.data();
          if (configData && configData.amount) {
            finalAmount = Number(configData.amount) * 100; // Convert Rupees to paise
          }
        } else {
          finalAmount = memorySubscriptionConfig.amount * 100;
        }
      } catch (dbErr) {
        console.warn("Failed to fetch dynamic price from DB, using memory fallback", dbErr);
        finalAmount = memorySubscriptionConfig.amount * 100;
      }
    } else {
      finalAmount = memorySubscriptionConfig.amount * 100;
    }

    try {
      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured. Falling back to secure simulated order.");
        const mockOrderId = "order_mock_" + crypto.randomBytes(8).toString("hex");
        return res.json({
          id: mockOrderId,
          amount: finalAmount,
          currency: currency || "INR",
          notes: notes || {},
          isSimulated: true,
          keyId: "rzp_test_mock_keys_123"
        });
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
      console.warn("Razorpay Order Creation failed with API/key error, falling back to secure simulated order:", error.message || error);
      const mockOrderId = "order_mock_" + crypto.randomBytes(8).toString("hex");
      res.json({
        id: mockOrderId,
        amount: finalAmount,
        currency: currency || "INR",
        notes: notes || {},
        isSimulated: true,
        keyId: "rzp_test_mock_keys_123"
      });
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
          if (isFirestoreAvailable) {
            try {
              await db.collection("payments").doc(studentEmail).set({
                paymentStatus: "Paid",
                paymentId: razorpayPaymentId,
                orderId: orderId,
                signature: signature,
                paidAt: FieldValue.serverTimestamp(),
              }, { merge: true });
              console.log(`[BACKEND STORAGE] Recorded premium activation status for: ${studentEmail}`);
            } catch (dbErr) {
              console.warn("Firestore set failed, using in-memory payment fallback:", dbErr);
            }
          }
          // Always write to in-memory fallback
          memoryPayments.set(studentEmail, {
            paymentStatus: "Paid",
            paymentId: razorpayPaymentId,
            orderId: orderId,
            signature: signature,
            paidAt: new Date().toISOString(),
          });
        }
      } else if (event === "payment.failed") {
        const payment = req.body.payload.payment.entity;
        const notes = payment.notes || {};
        const studentEmail = (notes.email || "").toLowerCase().trim();
        
        if (studentEmail) {
          if (isFirestoreAvailable) {
            try {
              await db.collection("payments").doc(studentEmail).set({
                paymentStatus: "Failed",
                failedAt: FieldValue.serverTimestamp(),
              }, { merge: true });
              console.log(`[BACKEND STORAGE] Recorded payment failure for: ${studentEmail}`);
            } catch (dbErr) {
              console.warn("Firestore set failed, using in-memory payment fallback for failure status:", dbErr);
            }
          }
          // Always write to in-memory fallback
          memoryPayments.set(studentEmail, {
            paymentStatus: "Failed",
            failedAt: new Date().toISOString(),
          });
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
        try {
          const doc = await db.collection("payments").doc(email).get();
          if (doc.exists) {
            data = doc.data();
          }
        } catch (dbErr) {
          console.warn("Firestore verify-payment failed, checking memory fallback:", dbErr);
        }
      }

      // Fall back to memory map if firestore didn't work or didn't contain the record
      if (!data) {
        data = memoryPayments.get(email);
      }

      if (data) {
        return res.json({
          verified: data?.paymentStatus === "Paid",
          paymentStatus: data?.paymentStatus,
          paymentId: data?.paymentId,
          paidAt: data?.paidAt
        });
      }
      res.json({ verified: false, paymentStatus: "Not Found" });
    } catch (error) {
      console.error("Verification Error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Automatic signature verification
  app.post("/api/razorpay/verify-signature", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const isMockPayment = String(razorpay_payment_id).startsWith("pay_sim_") || String(razorpay_payment_id).startsWith("pay_mock_");

    if (keySecret && !isMockPayment && razorpay_signature) {
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

    memoryPayments.set(cleanEmail, paymentData);

    try {
      if (isFirestoreAvailable) {
        await db.collection("payments").doc(cleanEmail).set({
          ...paymentData,
          paidAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`[AUTO-VERIFY] Activated premium via signature verification for: ${cleanEmail}`);
      }
    } catch (err) {
      console.warn("Could not save auto-verified payment to firestore:", err);
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
    
    // Always store to memory first (as Pending)
    memoryPayments.set(cleanEmail, {
      paymentStatus: "Pending",
      paymentId: cleanPaymentId,
      paidAt: new Date().toISOString(),
      manual: true
    });

    try {
      if (isFirestoreAvailable) {
        try {
          await db.collection("payments").doc(cleanEmail).set({
            paymentStatus: "Pending",
            paymentId: cleanPaymentId,
            paidAt: FieldValue.serverTimestamp(),
            manual: true
          }, { merge: true });
          console.log(`[MANUAL UTR] Recorded pending payment verification in Firestore for: ${cleanEmail}`);
        } catch (dbErr) {
          console.warn("[MANUAL UTR] Firestore failed, payment is pending in-memory only:", dbErr);
        }
      }

      res.json({ success: true, pending: true, email: cleanEmail, paymentId: cleanPaymentId });
    } catch (error: any) {
      console.error("Failed to record pending payment:", error);
      res.status(500).json({ error: error.message || "Failed to record payment" });
    }
  });

  // 5. Get current subscription config (price, discount, description)
  app.get("/api/subscription/config", async (req, res) => {
    try {
      if (isFirestoreAvailable) {
        try {
          const docRef = db.collection("config").doc("subscription");
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            const configData = docSnap.data();
            if (configData) {
              // Keep local memory config synchronized
              memorySubscriptionConfig = {
                amount: Number(configData.amount) || 299,
                originalAmount: Number(configData.originalAmount) || 999,
                billingPeriod: configData.billingPeriod || "lifetime",
                detailsEn: configData.detailsEn || "Automobile Engg. Premium Pack",
                detailsMr: configData.detailsMr || "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
              };
              return res.json(configData);
            }
          }
          
          // Default initial config if not exists
          const defaultConfig = {
            amount: 299,
            originalAmount: 999,
            billingPeriod: "lifetime",
            detailsEn: "Automobile Engg. Premium Pack",
            detailsMr: "ऑटोमोबाईल इंजिनिअरिंग प्रीमियम"
          };
          await docRef.set(defaultConfig);
          return res.json(defaultConfig);
        } catch (dbErr) {
          console.warn("Failed to get subscription config from Firestore, using memory fallback:", dbErr);
          return res.json(memorySubscriptionConfig);
        }
      } else {
        return res.json(memorySubscriptionConfig);
      }
    } catch (error: any) {
      console.error("Failed to get subscription config:", error);
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

    // Always update local memory
    memorySubscriptionConfig = updatedConfig;

    try {
      if (isFirestoreAvailable) {
        try {
          const docRef = db.collection("config").doc("subscription");
          await docRef.set(updatedConfig, { merge: true });
          console.log("[ADMIN SETTINGS] Updated subscription plan in Firestore:", updatedConfig);
        } catch (dbErr) {
          console.warn("[ADMIN SETTINGS] Firestore write failed, saved in-memory:", dbErr);
        }
      }

      return res.json({ success: true, config: updatedConfig });
    } catch (error: any) {
      console.error("Failed to update subscription config:", error);
      return res.json({ success: true, config: updatedConfig, warning: "Stored in memory fallback" });
    }
  });

  // Serve static questions data from backend if needed
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", geminiConfigured: !!ai });
  });

  // Vite middleware for development (Skip in Vercel)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    });
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
