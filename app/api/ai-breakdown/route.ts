import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { task } = body as { task: { title: string } };

  const prompt = `
Break this task into smaller actionable steps:

Task: ${task.title}

Return JSON:
[
  { "step": "..." }
]
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0].message.content;

  let parsed: Array<{ step: string }>;

  try {
    parsed = JSON.parse(content || "[]") as Array<{ step: string }>;
  } catch {
    parsed = [];
  }

  return Response.json({
    steps: parsed,
  });
}
