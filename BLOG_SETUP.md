# Blog Setup Guide

Your blog is now set up! Here's what you need to do to complete the setup:

## 1. Set up Giscus (Comments)

1. Enable GitHub Discussions on your repository:
   - Go to https://github.com/harangju/homepage/settings
   - Scroll to "Features" section
   - Check "Discussions"

2. Get your Giscus configuration:
   - Visit https://giscus.app/
   - Enter your repo: `harangju/homepage`
   - Select "Discussion Category" (recommended: "General")
   - Copy the `data-repo-id` and `data-category-id` values

3. Update `src/Giscus.tsx`:
   - Replace the empty `data-repo-id` value with your repo ID
   - Replace the empty `data-category-id` value with your category ID

## 2. Set up GitHub Actions (Auto-deployment)

1. Get your Firebase service account:
   ```bash
   firebase login:ci
   ```
   This will give you a token.

2. Or create a service account:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

3. Add to GitHub Secrets:
   - Go to https://github.com/harangju/homepage/settings/secrets/actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire JSON content or the token

4. Update the workflow file if needed:
   - Check `.github/workflows/deploy.yml`
   - Update `projectId` if it's not `harangju-homepage`

## 3. How to Add New Posts

1. Create a new markdown file in the `posts/` directory:
   ```bash
   posts/my-new-post.md
   ```

2. Add frontmatter at the top:
   ```markdown
   ---
   title: My New Post Title
   date: 2026-01-29
   description: A short description of the post
   ---

   # Your content here

   Write your post in markdown...
   ```

3. Commit and push:
   ```bash
   git add posts/my-new-post.md
   git commit -m "Add new post: My New Post Title"
   git push
   ```

4. GitHub Actions will automatically:
   - Build the markdown into HTML
   - Deploy to Firebase
   - Post will be available at `harangju.com/my-new-post`

## Post Features

- **Comments**: Readers can comment using Giscus (GitHub Discussions)
- **Edit Suggestions**: "Edit on GitHub" button lets readers submit PRs
- **Automatic Listing**: New posts appear on your homepage automatically
- **SEO Friendly**: Clean URLs, proper metadata

## Testing Locally

```bash
# Build everything (including posts)
bun run build

# Serve locally
bun run serve
```

## Firebase Project ID

If your Firebase project ID is different from `harangju-homepage`, update:
- `.github/workflows/deploy.yml` (line with `projectId`)
