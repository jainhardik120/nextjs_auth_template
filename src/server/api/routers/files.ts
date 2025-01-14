import { config } from "@/lib/aws-config";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

export const filesRouter = createTRPCRouter({
  signedUrlForPut: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        filetype: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = new S3Client(config);
      const params = {
        Bucket: process.env.S3_BUCKET_NAME_NEW,
        Key: `public/${ctx.session.user.id}/${input.filename}`,
        ContentType: input.filetype,
      };
      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(client, command);
      return url;
    }),
  listUserUploadedFiles: protectedProcedure.query(async ({ ctx }) => {
    const client = new S3Client(config);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME_NEW,
      Prefix: `public/${ctx.session.user.id}/`,
    };
    const data = await client.send(new ListObjectsV2Command(params));
    return data.Contents;
  }),
});
