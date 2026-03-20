# AI DBA | Postgres EXPLAIN Visualizer 🐘🧠

A highly opinionated Next.js Micro SaaS designed to instantly analyze, translate, and visualize complex PostgreSQL `EXPLAIN ANALYZE` logs. 

No more switching contexts to pgAdmin or DBeaver. You paste a query plan, and an AI Agent acts as an expert Database Administrator, delivering a plain English diagnosis, the exact `CREATE INDEX` fix, and a Mermaid.js structural AST flowchart.

![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Anthropic](https://img.shields.io/badge/anthropic-%23FFFFFF.svg?style=for-the-badge&logo=anthropic&logoColor=black)

## The Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** TailwindCSS + Custom CSS Glassmorphism
* **AI Provider:** Anthropic Claude API (Claude 3.5 Sonnet / Haiku / Opus)
* **Flowchart Visuals:** Mermaid.js (Dynamic AST Rendering)

## The Problem
"PostgreSQL slow query" gets millions of searches. Developers hate reading raw `EXPLAIN ANALYZE` node trees (like `-> Seq Scan on users (cost=0.00..1845.00)`). The mental overhead required to visualize that execution tree breaks the flow state.

## The Solution
1. **The Backend (AI AST Parsing):** The Next.js API route takes the log and sends it to Claude Opus. Claude is prompted to act as an AST parser, structurally analyzing the execution tree, and returning a strict JSON object containing a `mermaid` graph payload.
2. **The Frontend (Flowchart Visualization):** A custom React `MermaidChart` component dynamically intercepts that JSON payload and renders an interactive flowchart alongside the AI's plain-English diagnosis.

## Local Setup

1. Clone the repository:
```bash
git clone https://github.com/njsaugatpoudel/explain-analyze-translator.git
cd explain-analyze-translator
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Anthropic API Key:
Create a `.env.local` file in the root directory and add:
```env
ANTHROPIC_API_KEY="sk-ant-api..."
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment (Vercel)
When deploying this repository to Vercel, you **MUST** configure the Environment Variable `ANTHROPIC_API_KEY` in the Vercel dashboard for the API route to function properly.
