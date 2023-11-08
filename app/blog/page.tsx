import { allPosts } from "@/.contentlayer/generated"
import Link from "next/link"

export default function Page() {
  return (
    <div className="prose dark:prose-invert mb-10">
      {
        allPosts
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
