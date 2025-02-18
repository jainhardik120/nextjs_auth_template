"use client";

import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Post } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

const columns: ColumnDef<Post>[] = [
  {
    id: "title",
    header: "Title",
    accessorKey: "title",
  },
  {
    id: "edit",
    header: "Edit",
    cell: (context) => {
      const postId = context.row.original.id;
      return (
        <button onClick={() => (window.location.href = `/post/${postId}`)}>
          Edit
        </button>
      );
    },
  },
  {
    id: "delete",
    header: "Delete",
    cell: (context) => {
      const postId = context.row.original.id;
      return (
        <button
          onClick={async () => {
            const response = await fetch(`/api/posts/${postId}`, {
              method: "DELETE",
            });
            if (response.ok) {
              window.location.reload();
            }
          }}
        >
          Delete
        </button>
      );
    },
  },
];

const PostsPage: React.FC = () => {
  const router = useRouter();
  const posts = api.post.getAllPosts.useQuery();
  const mutation = api.post.createNewPost.useMutation({
    onSuccess: (response) => {
      router.push(`/admin/post/${response}`);
    },
  });
  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={posts.data ?? []}
        CreateButton={
          <Button
            onClick={async () => {
              mutation.mutate();
            }}
          >
            New Post
          </Button>
        }
        filterOn="title"
        name="Posts"
      />
    </div>
  );
};

export default PostsPage;
