import { allPosts } from "@/.contentlayer/generated"
import { MoveLeft } from "lucide-react"
import Link from "next/link"

interface TagProps {
  params: {
    slug: string[]
  }
}

async function getPostsFromParams(params: TagProps["params"]) {
  const slug = params?.slug?.join("/")
  const posts = allPosts.filter((post) => post.tag === slug)

  if (!posts) {
    null
  }

  return posts
}


export async function generateStaticParams(): Promise<TagProps["params"][]> {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function Page({ params }: TagProps) {
  const slug = params?.slug?.join("/")
  const posts = await getPostsFromParams(params)

  return (
    <div className="prose dark:prose-invert mb-10">
      <div className="flex space-x-2 items-center">
        <Link href="/blog">
          <MoveLeft />
        </Link>
        <h3 className="m-0">
          ...#{slug}
        </h3>
      </div>
      {
        posts
        .sort((a, b) => {return Date.parse(b.date) - Date.parse(a.date)})
        .map((post) => (
          <div key={post._id} className="flex flex-col space-y-1">
            <Link href={post.slug}>
              <h3 className="mb-0">{post.title}</h3>
            </Link>
            <div className="flex space-x-2 items-center">
              <p className="m-0">
                { (new Date(Date.parse(post.date))).toDateString() }
              </p>
              {
                post.tag && 
                <a className="border rounded px-1 border-gray-400 no-underline">#{post.tag}</a> 
              }
            </div>
            {post.description && <p>{post.description}</p>}
          </div>
        ))
      }
    </div>
  )
}
