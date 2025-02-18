"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Route } from "next";
import { useRouter } from "next/navigation";

export const CreateDiagramButton = () => {
  const router = useRouter();
  const mutation = api.excalidraw.createDesign.useMutation({
    onSuccess: (response) => {
      router.push(`/admin/media/diagrams/${response}` as Route);
    },
  });
  return (
    <Button
      onClick={async () => {
        mutation.mutate();
      }}
    >
      Create new Diagram
    </Button>
  );
};
