import { api } from "@/trpc/server";
import { Post } from "@prisma/client";
import Link from "next/link";

export default async function BlogSection() {
  const blogs: Post[] = await api.post.getAllPosts();
  return (
    <section
      id="blog"
      className=" min-h-screen mx-auto container px-12 flex flex-col"
    >
      <div className="flex flex-col my-auto gap-12 items-center">
        <h2 className="text-center text-4xl font-bold">Blog</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-4xl">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/post/${blog.id}`}>
              <div className="flex flex-col h-full justify-between overflow-x-hidden">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {blog.title}
                  </h3>
                  <p className="mt-2 hidden sm:block text-gray-500 dark:text-gray-400">
                    {blog.description}
                  </p>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Published on {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/blog/1"
          className="mx-auto inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
          prefetch={false}
        >
          View All Blog Posts
        </Link>
      </div>
    </section>
  );
}
