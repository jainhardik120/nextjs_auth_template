"use client";

import Editor, { EditorRef } from "@/components/editor/advanced-editor";
import { JSONContent } from "novel";
import { useEffect, useRef, useState } from "react";
import { defaultValue } from "@/components/editor/default-value";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";

export type Topic = {
  title: string;
  keywordResearch: {
    searchVolume: string;
    competitionLevel: string;
  };
  outline: {
    subheadings: string[];
    keyPoints: string[];
  };
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<EditorRef>(null);

  const { data, isFetching, refetch } = api.post.getPostById.useQuery(
    {
      id: params?.id ?? "",
    },
    { enabled: false },
  );

  useEffect(() => {
    if (params?.id) {
      refetch();
    }
  }, [params]);

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setDescription(data.description);
      setInitialContent(JSON.parse(data.content || "") || defaultValue);
      setSlug(data.slug);
      setLoading(false);
    }
  }, [data]);

  const saveMutation = api.post.updatePostById.useMutation();

  const handleSave = async (content: JSONContent) => {
    await saveMutation.mutateAsync({
      id: params?.id ?? "",
      title,
      content: JSON.stringify(content),
      description,
      slug,
    });
  };

  if (isFetching || loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto px-4 grid gap-4 mt-1">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label>Content</Label>
        <Editor
          ref={editorRef}
          initialValue={initialContent ? initialContent : defaultValue}
          onChange={handleSave}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>
    </div>
  );
}
