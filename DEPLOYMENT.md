# Deployment Guide

## 🚀 Deploy to Cloudflare Pages

### Prerequisites
- GitHub account
- Cloudflare account (free)
- Supabase project with environment variables

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `portfolio-website` (or your preferred name)
3. Set it to Public or Private
4. Don't initialize with README (since you already have code)

### Step 2: Push Code to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/portfolio-website.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **"Pages"** in the sidebar
3. Click **"Create a project"**
4. Choose **"Connect to Git"**
5. Select GitHub and authorize Cloudflare
6. Choose your repository
7. Configure build settings:
   ```
   Build command: npm run build
   Build output directory: .output/public
   Root directory: /
   ```
   
   **Important:** Use `npm run build` instead of bun to avoid lockfile version conflicts with Cloudflare's Bun version.
8. Click **"Save and Deploy"**

### Step 4: Set Environment Variables

In Cloudflare Pages dashboard, go to your project → Settings → Environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 5: Deploy! 🎉

Your site will be automatically deployed and available at:
`https://your-project-name.pages.dev`

## 📋 What's Been Configured

✅ **Removed Lovable Dependencies**
- Removed `@lovable.dev/vite-tanstack-config`
- Updated `vite.config.ts` with proper TanStack Start configuration
- Added `vite-tsconfig-paths` to maintain path aliases

✅ **Fixed Build Issues**
- Created proper `main.tsx` entry point
- Added `index.html` for build process
- Fixed syntax errors in admin.tsx
- Successfully builds without errors

✅ **Cloudflare Ready**
- Configured `wrangler.jsonc` for Cloudflare Workers
- Build outputs to `.output/public` directory
- SSR compatible with Cloudflare Pages

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🌐 Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click **"Custom domains"**
3. Add your domain name
4. Update DNS records as instructed by Cloudflare

## 🔄 Automatic Deployments

Once connected to GitHub, Cloudflare Pages will automatically:
- Deploy on every push to main branch
- Create preview deployments for pull requests
- Update your live site automatically

Your portfolio is now ready for free hosting on Cloudflare Pages! 🚀
