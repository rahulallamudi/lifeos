import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { tasks, prompt } = await req.json();

    if (!tasks && !prompt) {
      return NextResponse.json({ plan: [] });
    }

    const plannerInput = tasks ?? prompt;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
You are Chitti, a practical planning assistant.

Return ONLY valid JSON in this format:
[
  { "task": "...", "reason": "...", "time": "09:00" }
]

Use the user input below to create a realistic plan.
- Respect available time if it is provided.
- If energy is low, schedule a few quick wins before deep work.
- If urgency is high, front-load urgent tasks.
- Keep entries concrete and execution-friendly.

User input:
${JSON.stringify(plannerInput)}
`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ plan: [] });
    }

    let parsed;
    const sanitizedContent = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");

    try {
      parsed = JSON.parse(sanitizedContent || "[]");
    } catch {
      console.log("AI returned invalid JSON:", content);
      parsed = [];
    }

    const plan = Array.isArray(parsed)
      ? parsed
          .filter((item) => {
            return Boolean(
              item &&
                typeof item === "object" &&
                typeof (item as { task?: unknown }).task === "string"
            );
          })
          .map((item) => {
            const slot = item as {
              task: string;
              reason?: string;
              time?: string;
            };

            return {
              task: slot.task,
              reason: typeof slot.reason === "string" ? slot.reason : "",
              time: typeof slot.time === "string" ? slot.time : "",
            };
          })
      : [];

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("API crash:", err);
    return NextResponse.json({ plan: [] });
  }
}
