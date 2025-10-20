# GitHub Pages Deployment Guide

This guide explains how to deploy the CADEALA app to GitHub Pages.

## Prerequisites

- GitHub repository (already set up: `https://github.com/ahmedanwarabdulaziz/points.git`)
- Node.js 18+ installed
- Git configured

## Deployment Steps

### 1. Automatic Deployment (Recommended)

The app is configured with GitHub Actions for automatic deployment:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your GitHub repository: `https://github.com/ahmedanwarabdulaziz/points`
   - Click on **Settings** tab
   - Scroll down to **Pages** section
   - Under **Source**, select **GitHub Actions**
   - Save the settings

3. **Monitor deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Wait for it to complete successfully

4. **Access your app:**
   - Your app will be available at: `https://ahmedanwarabdulaziz.github.io/points`

### 2. Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy the `out` directory:**
   - The static files are generated in the `out` directory
   - Upload the contents of `out` to your GitHub Pages repository

## Configuration Details

### Next.js Configuration
- **Static Export**: The app is configured with `output: 'export'` for static site generation
- **Build Output**: Static files are generated in the `out` directory
- **API Routes**: Configured with `dynamic = 'force-static'` for static export compatibility

### GitHub Actions Workflow
- **Trigger**: Runs on push to `main` or `master` branch
- **Build Process**: Installs dependencies, builds the app, and deploys to GitHub Pages
- **Output Directory**: Deploys the `out` directory to GitHub Pages

## Troubleshooting

### Common Issues

1. **Build fails**: Check the Actions tab for error details
2. **Pages not updating**: Ensure GitHub Pages source is set to "GitHub Actions"
3. **404 errors**: Verify the repository name matches the GitHub Pages URL

### Environment Variables

If your app needs environment variables:
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add your environment variables as repository secrets
3. Update the workflow file to use these secrets

## Custom Domain (Optional)

To use a custom domain:
1. Add your domain to the `cname` field in `.github/workflows/deploy.yml`
2. Configure DNS settings to point to GitHub Pages
3. Enable HTTPS in GitHub Pages settings

## Support

For issues with deployment:
- Check the GitHub Actions logs
- Verify your Next.js configuration
- Ensure all dependencies are properly installed

---

**Your app will be live at:** `https://ahmedanwarabdulaziz.github.io/points`
