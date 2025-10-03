export interface Frontmatter {
  title: string;
  [key: string]: any;
}

export interface Post {
  slug: string;
  frontmatter: Frontmatter;
  content: string;
}

// Import posts data generated at build time
import postsData from "../posts.json";

export function getAllPosts(): Post[] {
  return postsData as Post[];
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const posts = getAllPosts();
    return posts.find(post => post.slug === slug) || null;
  } catch (error) {
    console.error(`Error getting post ${slug}:`, error);
    return null;
  }
}
