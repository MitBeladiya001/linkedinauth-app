#!/bin/bash
# Quick deployment script for LinkedIn OAuth app

echo "🚀 LinkedIn OAuth App - Deployment Script"
echo "=========================================="
echo ""

# Step 1: Check git status
echo "1️⃣  Checking Git status..."
git status
echo ""

# Step 2: Add all files
echo "2️⃣  Adding files to Git..."
git add .
echo "✅ Files added"
echo ""

# Step 3: Commit
echo "3️⃣  Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
commit_msg="${commit_msg:=Complete LinkedIn OAuth 2.0 app - production ready}"
git commit -m "$commit_msg"
echo "✅ Commit created"
echo ""

# Step 4: Set main branch
echo "4️⃣  Setting up main branch..."
git branch -M main
echo "✅ Main branch configured"
echo ""

# Step 5: Add remote
echo "5️⃣  Adding GitHub remote..."
read -p "Enter your GitHub repo URL (e.g., https://github.com/username/repo.git): " repo_url
git remote add origin "$repo_url" 2>/dev/null || echo "Remote already exists"
echo "✅ GitHub remote configured"
echo ""

# Step 6: Push to GitHub
echo "6️⃣  Pushing to GitHub..."
git push -u origin main
echo "✅ Pushed to GitHub!"
echo ""

echo "📋 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign in with GitHub"
echo "3. Click 'Add New' → 'Project'"
echo "4. Select your repository"
echo "5. Add environment variables (see DEPLOYMENT.md)"
echo "6. Click 'Deploy'"
echo ""
echo "🎉 Done! Your app will be live in a few minutes."
