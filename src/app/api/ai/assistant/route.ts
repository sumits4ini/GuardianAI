import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const AssistantRequestSchema = z.object({
  message: z.string().min(1),
  safetyContext: z.object({
    journeyStatus: z.string().optional(),
    destination: z.string().optional(),
    riskScore: z.number().optional(),
    riskLevel: z.string().optional(),
    signals: z.array(z.string()).optional(),
    nearbyHazardsCount: z.number().optional(),
    isOverdue: z.boolean().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AssistantRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid assistant payload", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { message, safetyContext } = validated.data;
    const lower = message.toLowerCase();

    // Check specific scenario patterns
    const isPursuitDanger = /follow|chase|stalk|pursu|threat|attack|hurt|danger|weapon|grabbed|scared|help me/i.test(lower);
    const isLost = /lost|disorient|wrong turn|don't know where/i.test(lower);
    const isAreaUnsafe = /area|neighborhood|dark|deserted|shady|creepy|suspicious|abandoned/i.test(lower);
    const isFriendConcern = /friend|haven't reached|not home|missing|late|where is|hasn't arrived/i.test(lower);
    const isGeneralUnsafe = /don't feel safe|uncomfortable|anxious|nervous|afraid|bad vibe/i.test(lower);

    const isHighRisk = safetyContext?.riskLevel === "HIGH" || safetyContext?.riskLevel === "CRITICAL" || isPursuitDanger || isAreaUnsafe || isGeneralUnsafe;

    // Try Gemini if available
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${SYSTEM_PROMPTS.SAFETY_ASSISTANT}

CURRENT USER SAFETY CONTEXT:
${JSON.stringify(safetyContext || {}, null, 2)}

USER QUESTION: "${message}"

Respond with concise, calm, actionable safety advice. If the user asks why risk is high or what to do, directly cite their safety context signals.`;

        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();

        return NextResponse.json({
          success: true,
          reply,
          shouldShowSOSPrompt: isHighRisk,
          riskLevel: isPursuitDanger ? "CRITICAL" : isHighRisk ? "HIGH" : "SAFE",
          aiAvailable: true,
        });
      } catch (err) {
        console.warn("Gemini Safety Assistant offline, utilizing safety rule fallback:", err);
      }
    }

    // Deterministic Rule-Based Fallback Assistant (Phase 4 Multi-Scenario Coverage)
    let fallbackReply = "";
    let riskLevel = "SAFE";

    if (isPursuitDanger) {
      riskLevel = "CRITICAL";
      fallbackReply =
        "⚠️ If someone is following you or you are in immediate danger: Move briskly into the nearest open commercial store, crowded restaurant, or brightly lit lobby. Do not isolate yourself or go into alleys. Activate the Emergency SOS beacon below to alert your trusted contacts, and dial 112/911 if in immediate threat.";
    } else if (isLost) {
      riskLevel = "HIGH";
      fallbackReply =
        "1. Stop in a well-lit location and open the GuardianAI live safety map to re-orient.\n2. Tap 'I'm Safe' to share your live coordinates with your trusted contacts.\n3. Avoid cutting through unlit alleys or dark short-cuts; stick to main arterial avenues.";
    } else if (isFriendConcern) {
      riskLevel = "MODERATE";
      fallbackReply =
        "If you are concerned about a friend who hasn't reached home:\n1. Check if they have an active GuardianAI corridor or check-in timestamp.\n2. Send a direct safety ping or voice call.\n3. If they remain unresponsive and past their expected arrival time, alert mutual friends, resident advisors, or campus safety.";
    } else if (isAreaUnsafe || isGeneralUnsafe) {
      riskLevel = "HIGH";
      fallbackReply =
        "Trust your instincts. If your surroundings feel unsafe:\n1. Walk briskly toward wider, illuminated main streets with active businesses.\n2. Keep your phone in hand with the Emergency SOS beacon ready.\n3. Send a quick live check-in to your primary trusted contact.";
    } else if (/why.*(risk|high|score|change)/i.test(lower)) {
      if (safetyContext?.signals && safetyContext.signals.length > 0) {
        fallbackReply = `Your risk score is currently ${safetyContext.riskScore || "elevated"} (${safetyContext.riskLevel || "MODERATE"}) due to the following detected factors:\n\n• ${safetyContext.signals.join("\n• ")}\n\nStay on illuminated main corridors and complete your safety check-in.`;
      } else {
        fallbackReply = `Your current risk score reflects standard ambient factors (time of day and local area reporting density). No critical hazards are active in your direct corridor.`;
      }
    } else if (/what.*should.*i.*do|advice|help|next/i.test(lower)) {
      if (safetyContext?.isOverdue) {
        fallbackReply = `Your expected arrival time has passed. First, tap 'I'm Safe' on your dashboard to confirm your status, or extend your ETA by 10 minutes. If you need assistance, your emergency contacts are standing by.`;
      } else {
        fallbackReply = `1. Stay on well-lit main streets with open premises.\n2. Keep your phone charged and screen accessible.\n3. Complete scheduled check-ins so your trusted network knows you are safe.`;
      }
    } else if (/journey|route|status|corridor/i.test(lower)) {
      fallbackReply = `Your journey to "${safetyContext?.destination || "your destination"}" is currently ${safetyContext?.journeyStatus || "ACTIVE"}. Safety net monitoring is enabled.`;
    } else {
      fallbackReply = `I am your GuardianAI Personal Safety Assistant. I can explain your current risk factors, advise on safer pedestrian paths, or help you check in with your safety network. How can I assist with your safety?`;
    }

    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      shouldShowSOSPrompt: isHighRisk,
      riskLevel,
      aiAvailable: false,
      notice: "AI analysis unavailable — showing baseline safety assistant guidance.",
    });
  } catch (error) {
    console.error("Safety Assistant API error:", error);
    return NextResponse.json(
      { error: "Failed to process safety query", message: "Internal server error" },
      { status: 500 }
    );
  }
}
