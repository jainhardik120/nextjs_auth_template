import { client } from "@/trpc/react";
import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";

const stripQueryParameters = (url: string): string => {
  return url.split("?")[0];
};

function extractPublicPath(url: string): string | null {
  const match = url.match(/\/public\/(.*)/);
  return match ? match[1] : null;
}

const onUpload = async (file: File): Promise<string> => {
  const currentDatetime = new Date().toISOString().replace(/[:.]/g, "-");
  const filenameWithDatetime = `${currentDatetime}_${file.name}`;
  const signedUrl = await client.files.signedUrlForPut.mutate({
    filename: filenameWithDatetime,
    filetype: file.type,
  });
  const uploadResponse = await fetch(signedUrl, {
    method: "PUT",
    body: file,
  });
  if (!uploadResponse.ok) {
    console.log(uploadResponse.body);
    throw new Error("Error occurred during file upload.");
  }
  const publicPath = extractPublicPath(stripQueryParameters(signedUrl));
  console.log(publicPath);
  return `https://storage.hardikja.in/${publicPath}`;
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});
