# 🛡️ RitualDev Lab — Mission Control & Executive Operations Cockpit

> **Private Executive Operations & Ecosystem Telemetry Dashboard for RitualDev Lab.**  
> Target Domain: [**`https://hq.ritualdev.in`**](https://hq.ritualdev.in)  
> Access Restriction: Strictly enforced for administrator **`divyanshujethi`**.

---

## ⚡ Overview & Capabilities

**Mission Control** is the centralized nerve center for RitualDev Lab engineering, security, and distribution operations. It tracks real-time data across:

1. **Cross-Repo Code Radar (GitHub Operations)**:
   * Live status across all 10 core repositories (`poly`, `FinePrintAI`, `AgentShield`, `DBShield`, `SkillPrism`, `vscode-poly`, `setup-poly`, `poly-web`, `ecosystem-telemetry`, `mission-control`).
   * Stale/Open Pull Requests, Issues, CI/CD workflow status (Pass / Fail / In-Progress), and commit velocity.
   * Interactive repository drawer for inspect-and-triage workflows.

2. **Unified Registry Ingestion & Downloads**:
   * **npm Downloads:** Real-time 30-day interactive SVG time-series charts, 24h, 7d, and 30d metrics for `@ritualdev-lab/poly`, `@ritualdev-lab/fineprint`, `@ritualdev-lab/agentshield`, `@ritualdev-lab/skillprism`, `@ritualdev-lab/dbshield`.
   * **VS Code & Open VSX:** Installs, reviews, and star ratings for `vscode-poly`.
   * **Compiled Native Binaries:** Standalone release executable downloads by operating system (Windows x64 vs macOS arm64/x64 vs Linux).

3. **Enterprise Security & Compliance Watchdog**:
   * Real-time GitHub Dependabot CVE alerts across all repositories.
   * IP Firewall compliance gate ensuring zero copyleft (AGPL/GPL) contamination in proprietary projects.

4. **Live CLI Telemetry & Crash Reporting**:
   * `POST /api/telemetry` ingestion endpoint for anonymous, opt-in error signatures from `@ritualdev-lab/poly`.
   * Environment breakdown: % Linux vs % macOS vs % Windows, runtime distribution (Node.js versions, Python, Bun).

5. **AI Executive Briefing & Exportable Reports**:
   * Automated synthesis of multi-repo health, top-performing drivers, and weekly growth velocity.
   * 1-Click "Copy Markdown" and "Download Executive Report (.md)".

---

## 🔐 Authentication & Access Gate

Access to Mission Control is gated by strict identity verification:

### Method 1: GitHub OAuth
1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**:
   * **Application name:** `RitualDev Mission Control`
   * **Homepage URL:** `https://hq.ritualdev.in`
   * **Authorization callback URL:** `https://hq.ritualdev.in/api/auth/callback`
3. Copy **Client ID** and generate a **Client Secret**.
4. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in your environment variables.
5. Mission Control will verify that `user.login.toLowerCase() === "divyanshujethi"`. Any other user is blocked with `403 Forbidden`.

### Method 2: Direct Admin Personal Access Token (PAT)
* For instant local development and zero-setup deployment, enter your GitHub Personal Access Token (`ghp_...`) into the login gate.
* It calls `https://api.github.com/user` over HTTPS to cryptographically prove the token belongs to `divyanshujethi` and issues an encrypted session cookie.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/RitualDev-Lab/mission-control.git
cd mission-control

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set GITHUB_TOKEN=ghp_...

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to `https://hq.ritualdev.in` (Vercel)

1. Import `RitualDev-Lab/mission-control` into your [Vercel Dashboard](https://vercel.com).
2. Add Environment Variables:
   * `GITHUB_TOKEN`: Your GitHub PAT (`ghp_...`).
   * `ALLOWED_ADMIN_USER`: `divyanshujethi`.
   * `GITHUB_CLIENT_ID`: (Optional, for OAuth button).
   * `GITHUB_CLIENT_SECRET`: (Optional, for OAuth button).
   * `GITHUB_REDIRECT_URI`: `https://hq.ritualdev.in/api/auth/callback`.
3. In **Settings → Domains**, add `hq.ritualdev.in`.
4. In your DNS provider (Cloudflare, Namecheap, GoDaddy), add a CNAME record:
   ```
   Name: hq
   Target: cname.vercel-dns.com
   ```
5. Your private Mission Control is live!
