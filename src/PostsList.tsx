import { useEffect, useState } from "react";
import { Link } from "./Router";

interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  description?: string;
}

export function PostsList() {
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/posts/posts.json")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t">
      <h2 className="text-xl font-semibold mb-4">Writing</h2>
      <div className="space-y-4">
        {posts.map(post => (
          <article key={post.slug}>
            <Link href={`/${post.slug}`} className="link">
              <h3 className="font-medium">{post.title}</h3>
            </Link>
            {post.description && (
              <p className="text-slate-600 text-sm mt-1">{post.description}</p>
            )}
            <p className="text-slate-500 text-xs mt-1">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
