# GitHub Setup Commands

## After creating your GitHub repository, run these commands:

```bash
# 1. Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 2. Push your code to GitHub for the first time
git push -u origin main

# 3. Verify the connection
git remote -v
```

## For future updates:

```bash
# Add changes
git add .

# Commit changes
git commit -m "your commit message"

# Push to GitHub
git push
```

## Enable GitHub Pages:

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your game will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Repository URL Format:
- HTTPS: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`
- SSH: `git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git`

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name. 