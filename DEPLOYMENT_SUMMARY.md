# PolicySaathi Deployment – Simple Summary

**What is this?**  
An AI helper for health insurance that lives on the internet at:  
**http://178.104.167.206:3000**

---

## What We Built

A website where you can:
- 📄 Upload insurance PDFs
- 💬 Chat with an AI about your policy
- 🧠 Learn what your insurance covers

---

## How We Put It Online

1. **Rented a computer** in Germany (Hetzner Cloud) – $5/month
2. **Copied our code** from GitHub to that computer
3. **Installed tools** – Git, Docker, Docker Compose
4. **Created a secret key** so GitHub can talk to the server safely
5. **Opened the door** (firewall) so the world can visit port 3000
6. **Started the app** with Docker
7. **It works!** 🎉

---

## Problems We Fixed

| Problem | How We Fixed It |
|---------|----------------|
| Push was too big | Used the correct small folder |
| Docker build failed | Removed conflicting packages |
| TypeScript errors | Excluded scripts folder |
| Wrong Docker command | Changed `docker compose` to `docker-compose` |
| Missing secrets file | Created `.env.local` on server |
| SSH blocked | Added firewall rule for port 22 |
| GitHub blocked secrets | Used GitHub Secrets instead of files |

---

## How to Update the Website

1. Make changes on your computer
2. Save and commit:
   ```bash
   git add .
   git commit -m "What I changed"
   git push
   ```
3. Wait 2–4 minutes
4. Done! The website updates automatically

---

## Where to Find Things

- **Code:** `/home/deva/full_stack_app/policysathi` (your laptop)
- **Live server:** `/home/deva/policysathi` (Hetzner Germany)
- **GitHub:** https://github.com/divakar2121/policysathi
- **Database:** Supabase (cyhifnqwhxjloedimmui.supabase.co)

---

## Need Help?

Check the full report: `DEPLOYMENT_REPORT.md`  
Or run these commands:

```bash
# See if app is running
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206 "docker-compose ps"

# Check logs
ssh -i ~/.ssh/policysathi_hetzner deva@178.104.167.206 "cd /home/deva/policysathi && docker-compose logs --tail 50"
```

---

**Made with ❤️ by the PolicySaathi team**
