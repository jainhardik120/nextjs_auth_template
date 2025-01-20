import { z } from "zod";

import { DesignService, ExportService } from "@/canva-client";
import { getAccessTokenForUser, getUserClient } from "@/lib/canva";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CanvaJobStatus, PrismaClient } from "@prisma/client";

const canvaClientProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const client = await getClient(ctx.session.user.id, ctx.db);
  return next({
    ctx: {
      client: client,
    },
  });
});

export const canvaRouter = createTRPCRouter({
  getUserDesigns: canvaClientProcedure
    .input(
      z.object({
        continuation: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await DesignService.listDesigns({
        client: ctx.client,
        query: { continuation: input.continuation },
      });
      if (result.error || !result.data) {
        throw new TRPCError({
          message: result.error?.toString() || "No data retreived",
          code: "BAD_REQUEST",
        });
      }
      return result.data;
    }),
  listExports: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.canvaExportJob.findMany({
        where: { designId: input },
      });
    }),
  refreshExportStatus: canvaClientProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const result = await ExportService.getDesignExportJob({
        client: ctx.client,
        path: {
          exportId: input,
        },
      });
      if (result.error || !result.data) {
        throw new TRPCError({
          message: result.error?.toString() || "No data retreived",
          code: "BAD_REQUEST",
        });
      }
      switch (result.data.job.status) {
        case "in_progress":
          break;
        case "failed":
          await ctx.db.canvaExportJob.delete({
            where: {
              exportId: input,
            },
          });
          throw new TRPCError({
            message: result.data.job.error?.message || "Export failed",
            code: "BAD_REQUEST",
          });
        case "success":
          await ctx.db.canvaExportJob.update({
            where: {
              exportId: input,
            },
            data: {
              status: CanvaJobStatus.SUCCESS,
              urls: result.data.job.urls,
            },
          });
          break;
      }
      return result.data;
    }),
  exportDesign: canvaClientProcedure
    .input(
      z.object({
        designId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ExportService.createDesignExportJob({
        client: ctx.client,
        body: {
          design_id: input.designId,
          format: {
            type: "jpg",
            quality: 100,
          },
        },
      });
      if (result.error || !result.data) {
        throw new TRPCError({
          message: result.error?.toString() || "No data retreived",
          code: "BAD_REQUEST",
        });
      }
      const status: CanvaJobStatus = (() => {
        switch (result.data.job.status) {
          case "in_progress":
            return CanvaJobStatus.IN_PROGRESS;
          case "failed":
            return CanvaJobStatus.FAILED;
          case "success":
            return CanvaJobStatus.SUCCESS;
        }
      })();
      if (status !== CanvaJobStatus.FAILED) {
        const exportJob = await ctx.db.canvaExportJob.create({
          data: {
            exportId: result.data.job.id,
            designId: input.designId,
            status: status,
          },
        });
        return exportJob;
      } else {
        throw new TRPCError({
          message: "Export failed",
          code: "BAD_REQUEST",
        });
      }
    }),
  createDesign: canvaClientProcedure
    .input(
      z.object({
        name: z.string().min(1),
        width: z.number().min(1),
        height: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await DesignService.createDesign({
        client: ctx.client,
        body: {
          design_type: {
            type: "custom",
            width: input.width,
            height: input.height,
          },
          title: input.name,
        },
      });
      if (result.error || !result.data) {
        throw new TRPCError({
          message: result.error?.toString() || "No data retreived",
          code: "BAD_REQUEST",
        });
      }
      return result.data;
    }),
});

const getClient = async (userId: string, db: PrismaClient) => {
  let token: string;
  try {
    token = await getAccessTokenForUser(userId, db);
  } catch (e) {
    throw new TRPCError({
      message: (e as Error).message,
      code: "BAD_REQUEST",
    });
  }
  return getUserClient(token);
};
