# PolicySaathi Deployment Report
## How We Put the Health Insurance AI Assistant Live on the Internet

**Date:** April 17, 2026  
**Project:** PolicySaathi – An AI helper for Indian health insurance  
**Status:** ✅ Successfully Running

---

## 1. What is PolicySaathi?

PolicySaathi is like a smart robot friend that helps people understand their health insurance. It can:

- Read insurance policy PDFs and explain them in simple words
- Help with insurance claims (when you ask the company for money)
- Answer questions like "Is this hospital bill covered?"
- Compare different insurance policies

Think of it like having an insurance expert available 24/7 on your phone or computer!

---

## 2. What We Wanted to Do

We had a computer program (called PolicySaathi) that was ready, but it was only running on our local computers. We wanted to put it on the internet so **anyone** could use it from anywhere.

To do this, we needed to:
1. Get a computer in the cloud (rent a server)
2. Copy our program to that server
3. Make sure it runs all the time
4. Let people access it via a website

---

## 3. Step-by-Step What We Did

### Step 1: Get a Cloud Server (Like Renting a Computer)

We used **Hetzner Cloud** (a German company that rents computers).  
Server details:
- **Name:** varahi-2
- **IP Address:** 178.104.167.206 (like the server's phone number)
- **Location:** Nuremberg, Germany
- **Operating System:** Ubuntu 24.04 (like Windows, but for servers)

### Step 2: Set Up the Code Repository (GitHub)

We kept our code on **GitHub** (like Google Drive for code).  
Repository: `https://github.com/divakar2121/policysathi`

Why GitHub? So we can:
- Keep track of changes
- Let many people work together
- Auto-deploy when we update the code

### Step 3: Create a Database (Supabase)

We needed a place to store:
- User data
- Chat history
- Insurance policies

We used **Supabase** (like a super Excel sheet on the internet):
- URL: `https://cyhifnqwhxjloedimmui.supabase.co`
- Tables created: `policies`, `claims`, `chat_history`
- Filled with sample data (10 policies, 8 claims, 24 chat messages)

### Step 4: Prepare the Server (Installing Tools)

We logged into the Hetzner server and installed:

1. **Git** – to download code from GitHub
2. **Docker** – like a shipping container for software (makes it run anywhere)
3. **Docker Compose** – tool to manage Docker containers

Commands we ran:

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-plugin
```

### Step 5: Set Up Connections (SSH Keys)

To allow GitHub to talk to the server securely, we created **SSH keys**.

What are SSH keys? They're like a special key and lock system:
- **Public key** (the lock) – put on the server
- **Private key** (the key) – kept secret in GitHub

We generated a key pair on our computer:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/policysathi_hetzner -C "deployment"
```

Then:
- Put the **public key** in `/home/deva/.ssh/authorized_keys` on the server
- Put the **private key** into GitHub Secrets (named `SSH_KEY`)
- Also added `SERVER_HOST=178.104.167.206` and `SERVER_USER=deva` secrets

### Step 6: Configure the Firewall

Cloud servers have a **firewall** (like a bouncer that decides who can enter).

Default: Only ports 80 (HTTP) and 3000 were open.  
We needed **port 22** for SSH (so GitHub can connect).

We added a rule:
```
Allow TCP port 22 from anywhere
```

We did this via Hetzner Console → Firewalls → Add Rule.

### Step 7: Create Environment Configuration

The app needs secret keys to work. We created a file called `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-... (for AI chat)
NEXT_PUBLIC_SUPABASE_URL=https://cyhifnqwhxjloedimmui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=policysathi-secret-key-2024-secure
GOOGLE_CLIENT_ID=
NEXTAUTH_URL=http://178.104.167.206:3000
```

We put this file on the server at `/home/deva/policysathi/.env.local`.

### Step 8: Build and Run with Docker

We used Docker to package the app:

```bash
cd /home/deva/policysathi
docker-compose build   # builds the app into a container
docker-compose up -d   # starts it in the background
```

Docker downloads Node.js, installs dependencies, builds the Next.js app, and starts it on **port 3000**.

---

## 4. The Problems We Faced (and How We Fixed Them)

### Problem 1: GitHub Push Was Too Big → Timeout

**Issue:** First we tried pushing from the wrong folder (a huge 573MB monorepo). GitHub timed out.

**Fix:** We realized the actual project was in `/home/deva/full_stack_app/policysathi` (only 420KB). We pushed from there.

---

### Problem 2: Docker Build Failed – Conflicting Packages

**Issue:** The `package.json` had both `react-scripts` (for Create React App) **and** `next` (for Next.js). They conflict. Also had Tailwind v4 which needs v3.4.

**Fix:** We removed `react-scripts` and `@tailwindcss/postcss` from `package.json`:

```json
{
  "dependencies": {
    "next": "^14.2.35",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    // ... other packages
  },
  "devDependencies": {
    "tailwindcss": "3.4",  // pinned to v3.4
    "typescript": "^5.9.3"
  }
}
```

---

### Problem 3: TypeScript Compilation Error

**Issue:** TypeScript tried to compile `scripts/seed.ts` which had Node.js types not meant for frontend.

**Fix:** Excluded the scripts folder in `tsconfig.json`:

```json
{
  "exclude": ["node_modules", "scripts"]
}
```

---

### Problem 4: Docker Compose Command Mismatch

**Issue:** The GitHub Actions workflow used `docker compose` (with space), but the server had `docker-compose` (hyphen) binary.

**Fix:** Updated `.github/workflows/deploy.yml` to use `docker-compose` and also add logic to install it if missing, plus clone the repo if not present.

---

### Problem 5: `.env.local` File Missing on Server

**Issue:** The Docker build failed because the environment file wasn't on the server. It's in `.gitignore` (for security).

**Fix:** Created the file manually on the server via SSH:
```bash
cat > /home/deva/policysathi/.env.local
[contents pasted]
```

Then later added an `ENV_LOCAL` GitHub secret so the workflow can write this file automatically.

---

### Problem 6: SSH Connection Refused

**Issue:** Trying to SSH from local machine to server got "Connection timed out" on port 22.

**Fix:** Added firewall rule to allow inbound SSH (port 22) in Hetzner Console → Firewalls → Add Rule: `TCP 22 from 0.0.0.0/0`.

---

### Problem 7: GitHub Secret Scan Blocked Push

**Issue:** When we added the private key directly to a commit, GitHub detected it as a secret and blocked the push.

**Fix:** We removed the file from tracking, added it to `.gitignore`, and stored it as a GitHub **Secret** instead (which is encrypted and safe).

---

## 5. How to Use PolicySaathi Now

### For End Users:

Open your browser and go to:
```
http://178.104.167.206:3000
```

You'll see the homepage with three main options:

1. **Chat** – Ask questions about insurance
2. **Policies** – Upload your insurance PDF
3. **Lawyer Arena** – Practice arguing your case

### For Developers (Making Changes):

1. Edit code locally on your computer
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push
   ```
3. GitHub Actions automatically deploys to Hetzner (takes 2–5 minutes)

---

## 6. Checking If It's Working

### Quick Test
```bash
curl http://178.104.167.206:3000
```
Should return HTML starting with `<!DOCTYPE html>`.

### Check Docker Containers on Server
```bash
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206
cd /home/deva/policysathi
docker-compose ps
```

Expected:
```
NAME                IMAGE             STATUS
policysathi-web-1   policysathi-web   Up 5 minutes
```

### View Logs
```bash
docker-compose logs --tail 50
```

---

## 7. Files and Their Jobs

| File/Folder | What It Does |
|------------|--------------|
| `app/` | Contains the Next.js pages (like `app/page.tsx` = homepage) |
| `components/` | Reusable UI pieces (buttons, cards, navigation) |
| `lib/db/supabase.ts` | Connects to Supabase database |
| `docker-compose.yml` | Tells Docker how to run the app |
| `Dockerfile` | Instructions to build the Docker image |
| `.env.local` | Secret keys (not in Git) |
| `supabase-setup.sql` | Database table definitions |
| `supabase-seed-data.sql` | Sample data to populate the DB |
| `.github/workflows/deploy.yml` | Auto-deploy instructions |

---

## 8. What Happens When You Push to GitHub

Here's the full automatic flow:

```
You push code
     ↓
GitHub detects new commit
     ↓
GitHub Actions starts 'Deploy to Hetzner' workflow
     ↓
Builds Docker image on GitHub's computers
     ↓
SSH into server (178.104.167.206) using SSH_KEY secret
     ↓
Runs these commands on server:
    cd /home/deva/policysathi
    git pull origin main
    docker-compose down || true
    docker-compose build
    docker-compose up -d
    docker system prune -f
     ↓
Old container stops, new one starts
     ↓
App is live at http://178.104.167.206:3000
```

Total time: ~2–4 minutes.

---

## 9. Important Security Notes

⚠️ **Never commit these to Git:**
- `.env.local` (contains API keys)
- Private SSH keys (`*.pem`, `id_*` files)
- Database passwords

✅ **Use GitHub Secrets instead:**
- `SSH_KEY` – private key for server access
- `ENV_LOCAL` – environment variables (optional, for auto-deploy)
- `SERVER_HOST` and `SERVER_USER` – server details

---

## 10. Common Problems & Solutions

### Problem: "Connection refused" on port 3000
**Cause:** Container not running.  
**Fix:** 
```bash
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206
cd /home/deva/policysathi
docker-compose up -d
```

---

### Problem: "Page not found" or 404
**Cause:** Container crashed or building.  
**Fix:** Check logs:
```bash
docker-compose logs --tail 100
```
Look for red error messages. Common causes:
- Missing `.env.local`
- Typo in config
- Port already in use

---

### Problem: "Permission denied (publickey)" when SSH
**Cause:** Public key not in `authorized_keys` on server.  
**Fix:** 
```bash
# On server
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
[Paste your public key here]
EOF
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

### Problem: Docker image too large (2+ GB)
**Cause:** Including unnecessary files (node_modules, cache).  
**Fix:** The `.dockerignore` file already excludes them. If still large, check:
```bash
docker images | grep policysathi
docker history policysathi-web:latest
```
And optimize `Dockerfile` by using multi-stage builds.

---

### Problem: GitHub Actions workflow fails with "docker: unknown command"
**Cause:** Server has `docker-compose` but workflow uses `docker compose`.  
**Fix:** We already updated workflow to use `docker-compose`.

---

### Problem: Database errors (RLS policy violation)
**Cause:** Supabase Row Level Security blocks anonymous reads/writes.  
**Fix:** Use service role key for admin operations (already seeded data with it). For user queries, implement authentication (NextAuth) and proper RLS policies.

---

### Problem: App builds but shows blank page
**Cause:** Client-side only code used during SSR, or missing environment variables.  
**Check:** Open browser DevTools (F12) → Console tab for red errors.  
**Fix:** Ensure all env vars prefixed with `NEXT_PUBLIC_` are available at build time.

---

## 11. Where Things Are

### Server (Hetzner)
- **IP:** 178.104.167.206
- **User:** deva
- **SSH Key:** `~/.ssh/policysathi_hetzner` (private key on your laptop)
- **App location:** `/home/deva/policysathi`
- **Docker Compose:** `/usr/local/bin/docker-compose`
- **Running on:** Port 3000 → accessible via internet

### GitHub Repository
- **URL:** https://github.com/divakar2121/policysathi
- **Main branch:** `main`
- **Workflow file:** `.github/workflows/deploy.yml`
- **Secrets (in Settings):** `SSH_KEY`, `SERVER_HOST`, `SERVER_USER`, `ENV_LOCAL` (optional)

### Supabase Database
- **Project ID:** cyhifnqwhxjloedimmui
- **URL:** https://cyhifnqwhxjloedimmui.supabase.co
- **Tables:** policies, claims, chat_history
- **Seeded:** 10 policies, 8 claims, 24 chat messages

---

## 12. Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Hetzner Cloud Server (cx21) | ~€5/month | 2 vCPU, 4 GB RAM, 40 GB SSD |
| Supabase Free Tier | $0 | 500 MB database, 1 GB storage, 2 GB bandwidth |
| GitHub (Public repo) | $0 | Free for public repositories |
| Domain (optional) | ~$10/year | If you want `policysathi.com` |

**Total monthly cost:** ~$6–7 (very cheap!)

---

## 13. What's Next? (Future Improvements)

1. **Add Authentication** – Let users log in and save their policies
2. **SSL Certificate** – Use HTTPS (Let's Encrypt free certificate)
3. **Custom Domain** – Point `policysathi.com` to the server
4. **Database Backups** – Auto-backup Supabase data daily
5. **Monitoring** – Get alerts if the app crashes
6. **Load Balancer** – If many users come, spread across multiple servers
7. **Mobile App** – Wrap the website in a phone app (React Native)

---

## 14. Quick Reference Commands

### Deploy Manually (if needed)
```bash
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206
cd /home/deva/policysathi
git pull origin main
docker-compose down || true
docker-compose build
docker-compose up -d
docker-compose logs -f
```

### See Running Containers
```bash
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206 "docker-compose ps"
```

### Restart the App
```bash
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206 "cd /home/deva/policysathi && docker-compose restart"
```

### Stop the App
```bash
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206 "cd /home/deva/policysathi && docker-compose down"
```

### View Logs
```bash
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206 "cd /home/deva/policysathi && docker-compose logs --tail 100"
```

---

## 15. Summary

✅ **Server rented** (Hetzner varahi-2)  
✅ **Code deployed** via GitHub Actions  
✅ **Database seeded** with sample insurance data  
✅ **App running** at http://178.104.167.206:3000  
✅ **Auto-deploy** works – push to GitHub → updates automatically  

**PolicySaathi is now LIVE on the internet!**

Anyone can visit `http://178.104.167.206:3000` and use the AI health insurance assistant.

---

*Report generated on April 17, 2026*  
*All steps documented for future reference and team onboarding*
