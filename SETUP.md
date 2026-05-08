# Setting up Edura on a new machine

This project is a Node.js app with a **Vite + React** frontend (`client/`) and an **Express** API (`server/`). Course and related data live as JSON files under `server/data`—there is **no separate database server** to install.

## Prerequisites

| Tool | Notes |
|------|--------|
| **Git** | To clone the repository. |
| **Node.js + npm** | Use **Node.js 18 or newer** (LTS recommended, e.g. 20.x or 22.x). The stack uses ES modules and Vite 6. |

Verify after installation:

```bash
node -v
npm -v
```

### Optional: Python

**Python 3** is **not** required for the web app. Install it only if you use helper scripts under `.agents/skills/` (each skill may ship its own `requirements.txt`).

---

## Install Node.js

### Windows

Using winget:

```bash
winget install OpenJS.NodeJS.LTS
```

Or download the LTS installer from [https://nodejs.org/](https://nodejs.org/).

### macOS

Using Homebrew:

```bash
brew install node
```

Or use the official installer from [https://nodejs.org/](https://nodejs.org/).

### Linux (Debian/Ubuntu example)

```bash
sudo apt update
sudo apt install -y nodejs npm
```

If your distro’s packages are too old, use [nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install --lts
nvm use --lts
```

---

## Clone and install dependencies

From your projects directory:

```bash
git clone <repository-url> EduHub
cd EduHub
npm run install:all
```

`install:all` runs `npm install` at the repo root (installs `concurrently` and wires scripts), then installs dependencies in `server/` and `client/`.

---

## Environment variables

1. Copy the example file:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server\.env.example server\.env
```

2. For **local development**, you often do **not** need to change anything: if `ALLOWED_ORIGINS` is unset, the server allows `http://localhost:8080` and `http://127.0.0.1:8080` for CORS.

3. Set **`ALLOWED_ORIGINS`** in production to your real frontend origins (comma-separated, no trailing slashes).

4. **SMTP** variables are for the contact form and optional email delivery. If `SMTP_HOST` is empty, messages can still be handled without sending email (see server behavior). Configure SMTP when you need real outbound mail.

See `server/.env.example` for all variables and comments.

---

## Run in development

From the **repository root**:

```bash
npm run dev
```

This starts:

- **API (Express)** on port **4000**
- **Vite dev server** on port **8080**, proxying `/api` to `http://127.0.0.1:4000`

Open **http://localhost:8080** in the browser.

---

## Production-style run

Build the client, then start the server (which serves the built SPA and the API):

```bash
npm run build
npm start
```

The server listens on `PORT` from `.env`, or **4000** by default.

---

## Optional: seed internships data

```bash
npm run seed:internships
```

---

## Optional: Agent skills (Python)

If you use scripts under `.agents/skills/`, install **Python 3** and dependencies per skill, for example:

```bash
pip install -r .agents/skills/voice-to-text/requirements.txt
```

This is separate from running Edura itself.

---

## Troubleshooting

- **Ports in use**: Development needs **8080** (Vite) and **4000** (API). Stop other apps using those ports or adjust `PORT` / Vite’s `server.port` if you change them consistently.
- **Windows**: The dev proxy targets **127.0.0.1:4000** (already set in `client/vite.config.js`) to avoid inconsistent `localhost` resolution.
