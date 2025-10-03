#!/usr/bin/env bun
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export interface Frontmatter {
  title: string;
  [key: string]: any;
}

export interface Post {
  slug: string;
  frontmatter: Frontmatter;
  content: string;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: { title: "Untitled" }, content };
  }

  const frontmatterStr = match[1];
  const contentStr = match[2];

  const frontmatter: Frontmatter = { title: "Untitled" };

  frontmatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
    }
  });

  return { frontmatter, content: contentStr.trim() };
}

function getAllPosts(): Post[] {
  const postsDirectory = join(process.cwd(), 'content', 'posts');
  const filenames = readdirSync(postsDirectory);

  return filenames
    .filter(filename => filename.endsWith('.mdx'))
    .map(filename => {
      const slug = filename.replace('.mdx', '');
      const fullPath = join(postsDirectory, filename);
      const fileContents = readFileSync(fullPath, 'utf8');

      const { frontmatter, content } = parseFrontmatter(fileContents);

      return {
        slug,
        frontmatter,
        content
      };
    });
}

// Generate posts data at build time
const posts = getAllPosts();
const postsJson = JSON.stringify(posts, null, 2);

// Write to src directory so it can be imported
writeFileSync(join(process.cwd(), 'src', 'posts.json'), postsJson);

console.log(`✅ Generated posts.json with ${posts.length} posts`);
