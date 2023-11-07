import { notFound } from "next/navigation"
import { Metadata } from "next"
import { allPages } from "contentlayer/generated"
import { Mdx } from "@/components/mdx-components"

export const metadata: Metadata = {
  title: "Harang Ju",
  description: "",
}

export default async function PagePage() {
  const slug = "about"
  const page = allPages.find((page) => page.slugAsParams === slug)

  if (!page) {
    notFound()
  }

  return (
    <article className="py-6 prose dark:prose-invert">
      <Mdx code={page.body.code} />
    </article>
  )
}
