import { useEffect, useState } from "react";
import { Giscus } from "./Giscus";
import { Link } from "./Router";

interface PostData {
  slug: string;
  title: string;
  date: string;
  description?: string;
  content: string;
}

export function Post({ slug }: { slug: string }) {
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/posts/${slug}.json`)
      .then(res => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen justify-between max-w-2xl mx-auto pt-6 px-4">
        <main className="prose py-6">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col h-screen justify-between max-w-2xl mx-auto pt-6 px-4">
        <main className="prose py-6">
          <h1>Post Not Found</h1>
          <p>The post you're looking for doesn't exist.</p>
          <Link href="/" className="link">← Back to home</Link>
        </main>
      </div>
    );
  }

  const editUrl = `https://github.com/harangju/homepage/edit/main/posts/${slug}.md`;

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto pt-6 px-4">
      <main className="flex-grow">
        <div className="mb-4">
          <Link href="/" className="link text-sm">← Back to home</Link>
        </div>
        <article className="prose max-w-none">
          <h1>{post.title}</h1>
          <p className="text-slate-600 text-sm">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <div className="mt-8 pt-4 border-t">
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link text-sm"
          >
            Edit this page on GitHub
          </a>
        </div>
        <div className="mt-12 mb-12">
          <Giscus slug={slug} />
        </div>
      </main>
    </div>
  );
}
