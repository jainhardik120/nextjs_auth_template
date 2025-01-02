import DesignList from "@/components/canva/list-designs";
import { config } from "@/lib/aws-config";
import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";

export default async function MediaPage() {
  const command = new ListObjectsCommand({
    Bucket: process.env.S3_BUCKET_NAME_NEW,
  });
  const client = new S3Client(config);
  const response = await client.send(command);
  console.log(response);

  return (
    <div>
      <DesignList />
    </div>
  );
}
