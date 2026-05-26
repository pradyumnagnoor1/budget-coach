# Budget Coach

An AI-powered personal finance coach. Built on the Rocket Money tracking model, but with an agentic AI coaching layer that autonomously analyzes spending, decides when to intervene, and delivers personalized guidance against user-defined budgets.

**Status:** In active development.

## What makes it different

Most budgeting apps tell you what happened. Budget Coach tells you what to do.

- **Forecast-forward UI** — the hero number is what you can safely spend today, not what you spent last month
- **Agentic AI coach** — Claude-powered agent autonomously pulls transactions, evaluates budget performance, and decides when coaching is warranted
- **Transparent reasoning** — every coaching decision shows its work via persisted reasoning traces

## Stack

- **Backend:** FastAPI, PostgreSQL, SQLAlchemy, Alembic
- **Frontend:** Next.js, TypeScript, Tailwind, shadcn/ui
- **AI:** Anthropic Claude (Sonnet for agent, Haiku for categorization) via AWS Bedrock
- **Integrations:** Plaid (transactions), AWS Cognito (auth with Google federation)
- **Infrastructure:** AWS ECS, RDS, EventBridge, Lambda

## Local development

Requirements: Docker, Python 3.12, Node 20+, uv.

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in API keys

docker compose up -d postgres
cd backend && uv sync
uv run uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend && npm install
npm run dev
```

Visit http://localhost:3000.

## License

MIT
