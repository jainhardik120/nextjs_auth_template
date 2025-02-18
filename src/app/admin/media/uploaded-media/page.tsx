import { api } from "@/trpc/server";

export default async function Page() {
  const files = await api.files.listUserUploadedFiles();
  console.log(files);
  return <div></div>;
}
