# PathFinder AI – LinuxONE Step-by-Step Deployment Guide

Deploy PathFinder AI on **IBM LinuxONE Community Cloud** (college free tier). One VM, Docker, PostgreSQL—no complex setup.

---

## What You'll Have at the End

- PathFinder AI running at `http://YOUR_VM_IP:5173`
- PostgreSQL database (no separate setup)
- All in Docker on a single Ubuntu VM

---

## Step 1: Get LinuxONE Access

1. Open: **https://community.ibm.com/zsystems/l1cc/**
2. Click **Try Virtual Machines on the LinuxONE Community Cloud**
3. Fill out the registration form
4. If you have an **Event Code** (e.g. SSF2025), enter it
5. Click **Request your trial**
6. Check your email and click the activation link
7. Save your **User ID** and **Password**

---

## Step 2: Set Up Your SSH Key (First Time Only)

You need an SSH key to connect to your VM.

### If you already have an SSH key

Skip to **Upload your key** below.

### If you need to create one

**Mac / Linux (Terminal):**
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/linuxone_key -N ""
```
This creates `~/.ssh/linuxone_key` (private) and `~/.ssh/linuxone_key.pub` (public).

**Windows (PowerShell):**
```powershell
ssh-keygen -t rsa -b 4096 -f $env:USERPROFILE\.ssh\linuxone_key -N ""
```

### Upload your key to LinuxONE

1. Log in: **https://linuxone.cloud.marist.edu/#/login**
2. Click **Virtual Servers** (top left)
3. Click your **username** (top right)
4. Click **Manage SSH Key Pairs**
5. Click **Create** (or **Import** if you have an existing public key)
6. Enter a name (e.g. `my-key`)
7. Click **Create a new key pair** and save the `.pem` file when prompted  
   - Or **Import** and paste/upload your `linuxone_key.pub` contents
8. Save your `.pem` file somewhere safe (you’ll need it for SSH)

---

## Step 3: Create Your Ubuntu VM

1. Go to **Home** → **Service Catalog** → **Virtual Servers**
2. Click **Manage Instances**
3. Click **Create**
4. Fill in:
   - **Instance Name**: `pathfinder` (no spaces, letters/numbers only)
   - **Image**: **Ubuntu 22.04**
   - **Flavor**: Use the default
   - **SSH Key**: Select the key you created or imported
5. Click **Create**
6. Wait until status is **ACTIVE** (may take 1–2 minutes)
7. Write down the **IP address** (e.g. `148.100.85.123`)

---

## Step 4: Connect to Your VM via SSH

Open a terminal (Mac/Linux) or PowerShell (Windows).

**Mac / Linux:**
```bash
chmod 600 /path/to/your-key.pem
ssh -i /path/to/your-key.pem linux1@YOUR_VM_IP
```
Replace:
- `/path/to/your-key.pem` with the path to your `.pem` file
- `YOUR_VM_IP` with your VM’s IP (e.g. `148.100.85.123`)

**Windows (PowerShell):**
```powershell
ssh -i "C:\path\to\your-key.pem" linux1@YOUR_VM_IP
```

You should see a prompt like: `linux1@pathfinder:~$`

---

## Step 5: Install Docker

Run these commands one by one on your VM:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

```bash
sudo usermod -aG docker $USER
```

```bash
newgrp docker
```

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

Check Docker:
```bash
docker run hello-world
```
You should see “Hello from Docker!”. Then:

```bash
docker rm $(docker ps -aq) 2>/dev/null; echo "Docker is ready"
```

---

## Step 6: Upload PathFinder AI to the VM

Choose one of these options.

### Option A: From GitHub (if the project is on GitHub)

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/pathfinder-ai.git
cd pathfinder-ai
```

Replace `YOUR_USERNAME` with your GitHub username or org.

### Option B: Copy from your laptop with SCP

On **your laptop** (not the VM), in a new terminal:

**Mac / Linux:**
```bash
cd /path/to/pathfinder-ai
scp -i /path/to/your-key.pem -r . linux1@YOUR_VM_IP:~/pathfinder-ai
```

**Windows (PowerShell):**
```powershell
scp -i "C:\path\to\your-key.pem" -r .\pathfinder-ai linux1@YOUR_VM_IP:~/
```

Then on the VM:
```bash
cd ~/pathfinder-ai
```

---

## Step 7: Open Firewall Ports

On the VM, allow traffic on ports 5173 (frontend) and 8000 (API docs):

```bash
sudo iptables -I INPUT -p tcp --dport 5173 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 8000 -j ACCEPT
```

Make the rules persistent:
```bash
sudo bash -c "iptables-save > /etc/iptables/rules.v4" 2>/dev/null || true
```

---

## Step 8: Start PathFinder with Docker

On the VM:

```bash
cd ~/pathfinder-ai
docker compose up -d --build
```

The first run can take 5–10 minutes. When it finishes, check containers:

```bash
docker compose ps
```

You should see three services running: `postgres`, `backend`, `frontend`.

---

## Step 9: Run Database Migrations

Create the database tables:

```bash
cd ~/pathfinder-ai

docker compose exec -T postgres psql -U postgres -d pathfinder_ai < backend/database/migrations/001_initial_schema.sql

docker compose exec -T postgres psql -U postgres -d pathfinder_ai < backend/database/migrations/002_pathfinder_profile.sql

docker compose exec -T postgres psql -U postgres -d pathfinder_ai < backend/database/migrations/003_add_job_salary.sql
```

If you see errors like “relation already exists”, that’s usually fine—tables may already be there.

---

## Step 10: Open PathFinder in Your Browser

- **Main app (frontend):** `http://YOUR_VM_IP:5173`  
- **API docs:** `http://YOUR_VM_IP:8000/docs`

Replace `YOUR_VM_IP` with your VM’s IP (e.g. `http://148.100.85.123:5173`).

---

## Quick Command Summary

| Action | Command |
|--------|---------|
| Start app | `cd ~/pathfinder-ai && docker compose up -d` |
| Stop app | `docker compose down` |
| View logs | `docker compose logs -f` |
| Restart | `docker compose restart` |

---

## Troubleshooting

### Can't connect with SSH

- Ensure the VM status is **ACTIVE**
- Try **Stop** and then **Start** in the LinuxONE portal
- Use user `linux1` (not `root`)
- Confirm you’re using the correct `.pem` file and IP

### "Permission denied" with Docker

```bash
newgrp docker
```
Or disconnect and reconnect via SSH.

### App doesn’t load in the browser

- Confirm containers are running: `docker compose ps`
- Check firewall: ports 5173 and 8000 must be open (Step 7)
- Use your VM’s public IP (not `localhost`)

### Database / migration errors

Run migrations again:
```bash
cd ~/pathfinder-ai
docker compose exec -T postgres psql -U postgres -d pathfinder_ai -f - < backend/database/migrations/002_pathfinder_profile.sql
```

### Out of disk space

```bash
docker system prune -a -f
```

---

## References

- [LinuxONE VM deployment guide](https://github.com/linuxone-community-cloud/technical-resources/blob/master/faststart/deploy-virtual-server.md)
- [LinuxONE portal](https://linuxone.cloud.marist.edu/#/login)
