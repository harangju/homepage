import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { marked } from "marked";

interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  description?: string;
}

interface Post extends PostMetadata {
  content: string;
}

const postsDirectory = join(process.cwd(), "posts");
const outputDirectory = join(process.cwd(), "build", "posts");

// Ensure output directory exists
mkdirSync(outputDirectory, { recursive: true });

// Get all markdown files
const filenames = readdirSync(postsDirectory).filter(file => file.endsWith(".md"));

const posts: PostMetadata[] = [];

filenames.forEach(filename => {
  const slug = filename.replace(/\.md$/, "");
  const filePath = join(postsDirectory, filename);
  const fileContents = readFileSync(filePath, "utf8");

  // Parse frontmatter and content
  const { data, content } = matter(fileContents);

  // Convert markdown to HTML
  const html = marked(content);

  // Create post object
  const post: Post = {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString().split("T")[0],
    description: data.description,
    content: html as string,
  };

  // Write individual post JSON
  writeFileSync(
    join(outputDirectory, `${slug}.json`),
    JSON.stringify(post, null, 2)
  );

  // Add to posts list (without content for the manifest)
  posts.push({
    slug: post.slug,
    title: post.title,
    date: post.date,
    description: post.description,
  });
});

// Sort posts by date (newest first)
posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Write posts manifest
writeFileSync(
  join(outputDirectory, "posts.json"),
  JSON.stringify(posts, null, 2)
);

console.log(`✓ Built ${posts.length} posts`);
