"use client";

import { renderEmail } from "@/actions/renderEmail";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function EmailEditorPage() {
  const [content, setContent] = useState("");
  return (
    <div>
      <h1>Email Editor</h1>
      <p>Here you can edit email templates</p>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <Button onClick={async () => {
        const result = await renderEmail("D:/nextjs-pro/src/emails/reset-password.tsx");
        console.log(result);
      }}>Save</Button>
    </div>
  );
}
