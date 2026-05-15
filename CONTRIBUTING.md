# Contributing to NewsExpress 🗞️

Thank you for your interest in contributing to **NewsExpress** — a premium, dark-luxury news platform powered by React, Supabase, Pinecone, and Groq AI.

---

## 📋 Table of Contents

- [Project Architecture](#-project-architecture)
- [Docker Setup](#-docker-setup)
- [Making a Contribution](#-making-a-contribution)

---

## 🏗️ Project Architecture

NewsExpress is a **frontend-only React app**. There is no custom backend server to run. All backend services are cloud-hosted:

| Service | Purpose | Hosted On |
|---|---|---|
| **Supabase** | User authentication + data storage (2 tables) | Supabase Cloud |
| **Pinecone** | Vector database for RAG (AI news search) | Pinecone Cloud |
| **Groq** | LLM inference (NOVA AI assistant) | Groq Cloud |
| **newsdata.io** | Live news feed API | External API |

> This means you only need to run the React app — no Docker Compose, no extra containers.

---

## 🐳 Docker Setup

### How the Dockerfile works

The Dockerfile builds the React app into a **static production bundle** and serves it on port 3000.

**Key concept:** `REACT_APP_*` environment variables are **baked into the JavaScript bundle at build time** by React — not at runtime. This means you must pass them as **`--build-arg`** flags during `docker build`, not as `-e` flags during `docker run`.

```dockerfile
# These ARGs accept values passed via --build-arg at build time
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_PINECONE_API_KEY
# ...

# Make them available as ENV so React's build process can read them
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
# ...

RUN npm run build   # <-- env vars are baked into JS here
```

---

### Build the Docker image

```bash
docker build -t news_express_fe:latest \
  --build-arg REACT_APP_SUPABASE_URL="https://your-project.supabase.co" \
  --build-arg REACT_APP_SUPABASE_ANON_KEY="your_supabase_anon_key" \
  --build-arg REACT_APP_PINECONE_API_KEY="your_pinecone_api_key" \
  --build-arg REACT_APP_PINECONE_INDEX="news-index" \
  --build-arg REACT_APP_GROQ_API_KEY="your_groq_api_key" \
  .
```

**On Windows (PowerShell), use backticks for line continuation:**

```powershell
docker build -t news_express_fe:latest `
  --build-arg REACT_APP_SUPABASE_URL="https://your-project.supabase.co" `
  --build-arg REACT_APP_SUPABASE_ANON_KEY="your_supabase_anon_key" `
  --build-arg REACT_APP_PINECONE_API_KEY="your_pinecone_api_key" `
  --build-arg REACT_APP_PINECONE_INDEX="news-index" `
  --build-arg REACT_APP_GROQ_API_KEY="your_groq_api_key" `
  .
```

---

### Run the container

```bash
docker run -p 3000:3000 news_express_fe:latest
```

The app will be available at **http://localhost:3000**.

---

### Useful Docker commands

```bash
# List running containers
docker ps

# Stop a running container
docker stop <container_id>

# Remove a stopped container
docker rm <container_id>

# Remove the image (to force a clean rebuild)
docker rmi news_express_fe:latest

# View container logs
docker logs <container_id>

# Run container in detached (background) mode
docker run -d -p 3000:3000 news_express_fe:latest
```

---

### ⚠️ Common Docker Mistakes

| Mistake | Why It Fails | Fix |
|---|---|---|
| Passing keys with `-e` at `docker run` | React bakes env vars at **build time**, runtime `-e` flags are ignored | Use `--build-arg` during `docker build` |
| Committing `.env` to Git | Exposes secret API keys publicly | `.env` is in `.gitignore` — never force-add it |
| Using `npm start` as CMD | Runs the **development** server in production (slow, insecure) | Use `serve -s build` or `npm start` only if CRA's start script is configured for production |

---

## 🤝 Making a Contribution

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and test locally with `npm start`
4. **Test with Docker** using the build command above to ensure it works in a container
5. **Commit**: `git commit -m "feat: describe your change"`
6. **Push**: `git push origin feature/your-feature-name`
7. **Open a Pull Request** against the `main` branch

### Commit message convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
style: UI/CSS changes
docs: documentation updates
refactor: code restructuring without behavior change
```

---

_Built with ❤️ — contributions welcome!_
