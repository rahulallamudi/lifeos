import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { tasks, fastCount, slowCount } = body as {
    tasks: Array<{
      title: string;
      priority?: "high" | "medium" | "low";
      status: string;
    }>;
    fastCount: number;
    slowCount: number;
  };

  const prompt = `
You are a productivity assistant.

Return ONLY JSON in this format:
[
  { "task": "...", "reason": "..." }
]

User tasks:
${tasks
  .map(
    (t) =>
      `- ${t.title} (priority: ${t.priority || "low"}, status: ${t.status})`
  )
  .join("\n")}

Behavior:
- Fast tasks: ${fastCount}
- Slow tasks: ${slowCount}

Max 5 items.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0].message.content;

  let parsed: Array<{ task: string; reason: string }>;

  try {
    parsed = JSON.parse(content || "[]") as Array<{
      task: string;
      reason: string;
    }>;
  } catch {
    parsed = [];
  }

  return Response.json({
    plan: parsed,
  });
}
