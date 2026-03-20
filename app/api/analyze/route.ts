import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    if (!plan) return NextResponse.json({ error: "No query plan provided" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY. Add it to Vercel Settings -> Environment Variables." }, { status: 500 });

    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are an expert PostgreSQL DBA. Analyze the provided EXPLAIN ANALYZE output.
You must return ONLY a raw JSON object (without any markdown formatting or \`\`\` wrappers) with exactly two keys:
1. "translation": A concise, plain-English explanation of the bottleneck and the EXACT SQL query (e.g., CREATE INDEX...) to fix it.
2. "mermaid": A valid Mermaid.js flowchart (graph TD) that visualizes the query execution tree. Use clear node names, like "Seq Scan (Users)". Do NOT wrap the mermaid code in markdown ticks inside the JSON string. Ensure the mermaid syntax is 100% valid.

EXPLAIN OUTPUT:
${plan}`;

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();
    
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
