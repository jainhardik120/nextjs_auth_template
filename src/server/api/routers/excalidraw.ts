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
    const bucketName = process.env.S3_BUCKET_NAME_NEW;
    const baseKey = `excalidraw_diagrams/${newDesign.id}`;
    const elementsParams = {
      Bucket: bucketName,
      Key: `${baseKey}_elements.json`,
      Body: JSON.stringify({
        elements: [],
      }),
    };
    const filesParams = {
      Bucket: bucketName,
      Key: `${baseKey}_files.json`,
      Body: JSON.stringify({
        files: [],
      }),
    };
    await Promise.all([
      s3Client.send(new PutObjectCommand(elementsParams)),
      s3Client.send(new PutObjectCommand(filesParams)),
    ]);
    return newDesign.id;
  }),
  getSignedUrlDesign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const client = new S3Client(config);
      const bucketName = process.env.S3_BUCKET_NAME_NEW;
      const baseKey = `excalidraw_diagrams/${input.id}`;
      const elementsParams = {
        Bucket: bucketName,
        Key: `${baseKey}_elements.json`,
      };
      const filesParams = {
        Bucket: bucketName,
        Key: `${baseKey}_files.json`,
      };
      const elementsUrl = await getSignedUrl(
        client,
        new GetObjectCommand(elementsParams),
      );
      const filesUrl = await getSignedUrl(
        client,
        new GetObjectCommand(filesParams),
      );
      return {
        elementsUrl,
        filesUrl,
      };
    }),
  getSignedUrlForPutFiles: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const client = new S3Client(config);
      const bucketName = process.env.S3_BUCKET_NAME_NEW;
      const key = `excalidraw_diagrams/${input.id}_files.json`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: "application/json",
      });

      const signedUrl = await getSignedUrl(client, command, {
        expiresIn: 3600,
      });
      return signedUrl;
    }),
  updateElements: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        elements: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const client = new S3Client(config);
      const bucketName = process.env.S3_BUCKET_NAME_NEW;
      const key = `excalidraw_diagrams/${input.id}_elements.json`;

      try {
        JSON.parse(input.elements);

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: JSON.stringify({ elements: JSON.parse(input.elements) }),
          ContentType: "application/json",
        });

        await client.send(command);
        return { success: true };
      } catch (error) {
        console.error("Error updating elements:", error);
        throw new Error(
          "Failed to update elements. Ensure the input is valid JSON.",
        );
      }
    }),
});
