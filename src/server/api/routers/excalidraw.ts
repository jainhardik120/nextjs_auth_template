import { config } from "@/lib/aws-config";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const excalidrawRouter = createTRPCRouter({
  listDesigns: protectedProcedure.query(async ({ ctx }) => {
    const designs = await ctx.db.excalidrawDiagrams.findMany();
    return designs;
  }),
  createDesign: protectedProcedure.mutation(async ({ ctx }) => {
    const newDesign = await ctx.db.excalidrawDiagrams.create({
      data: {
        lastModified: new Date(Date.now()),
      },
    });
    const s3Client = new S3Client(config);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME_NEW,
      Key: "excalidraw_diagrams/" + newDesign.id + ".json",
      Body: JSON.stringify({
        elements: [],
        files: [],
      }),
    };
    await s3Client.send(new PutObjectCommand(params));
    return newDesign.id;
  }),
  getSignedUrlDesign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const client = new S3Client(config);
      const params = {
        Bucket: process.env.S3_BUCKET_NAME_NEW,
        Key: "excalidraw_diagrams/" + input.id + ".json",
      };
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(client, command);
      return url;
    }),
  getSignedUrlForPut: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = new S3Client(config);
      const params = {
        Bucket: process.env.S3_BUCKET_NAME_NEW,
        Key: "excalidraw_diagrams/" + input.id + ".json",
        ContentType: input.contentType,
      };
      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(client, command, { expiresIn: 900 });
      return url;
    }),
});
