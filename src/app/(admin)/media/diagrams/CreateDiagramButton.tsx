"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export const CreateDiagramButton = () => {
  const router = useRouter();
  const mutation = api.excalidraw.createDesign.useMutation({
    onSuccess: (response) => {
      router.push(`/media/diagrams/${response}`);
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
