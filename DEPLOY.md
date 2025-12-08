# Deployment Instructions

## Option 1: Render.com (Recommended - Free Tier)

1. **Create a GitHub repository:**
   ```bash
   cd /Users/natalietosh/cursor-projects/prove-ai-poc
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   ```

2. **Push to GitHub:**
   - Create a new repository on GitHub
   - Then run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/prove-ai-poc.git
   git push -u origin main
   ```

3. **Deploy on Render:**
   - Go to https://render.com
   - Sign up/login (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name:** prove-ai-poc
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Click "Create Web Service"
   - Your app will be live at: `https://prove-ai-poc.onrender.com`

## Option 2: Vercel (Also Free)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd /Users/natalietosh/cursor-projects/prove-ai-poc
   vercel
   ```
   - Follow the prompts
   - Your app will be live at: `https://prove-ai-poc.vercel.app`

## Option 3: Railway (Free Trial)

1. Go to https://railway.app
2. Sign up/login
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your repository
5. Railway auto-detects Node.js and deploys
6. Your app will be live at: `https://prove-ai-poc.up.railway.app`

## Quick Deploy (No Git Required) - Render

1. Go to https://render.com
2. Sign up/login
3. Click "New +" → "Web Service"
4. Click "Public Git repository"
5. Paste your GitHub repo URL (or use Render's GitHub integration)
6. Render will auto-detect settings
7. Click "Create Web Service"

## Notes

- The app uses port 3005 locally, but Render/Vercel will set the PORT environment variable automatically
- Your Glance cobrowse script will work once deployed to a public URL
- Make sure your Glance group ID (24504) and site (staging) are correct for production

