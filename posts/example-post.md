---
title: Example Post
date: 2026-01-29
description: This is an example post to demonstrate the markdown blog feature
---

# Welcome to Your New Blog

This is an example post written in Markdown. You can:

- Write in **bold** or *italic*
- Create lists
- Add [links](https://harangju.com)
- Include code blocks

```javascript
function hello() {
  console.log("Hello, world!");
}
```

## How it Works

Just add a new `.md` file to the `posts/` directory with frontmatter at the top, commit and push. GitHub Actions will automatically build and deploy your site.

The post will be available at `harangju.com/post-slug` where the slug is derived from the filename.

## Comments

People can comment using Giscus (powered by GitHub Discussions) and suggest edits by clicking the "Edit on GitHub" button.
