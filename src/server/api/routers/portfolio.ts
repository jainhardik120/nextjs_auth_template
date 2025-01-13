import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const portfolioRouter = createTRPCRouter({
  getSkills: publicProcedure.query(async ({ ctx }) => {
    const skills = await ctx.db.skill.findMany({
      include: {
        skills: true,
      },
    });
    return skills;
  }),
  getProjectsGroupedByCategory: publicProcedure.query(async ({ ctx }) => {
    const projectsGroupedByCategory = await ctx.db.project.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
    });

    const projects = await ctx.db.project.findMany();
    const groupedData = projectsGroupedByCategory.map((group) => ({
      id: group.category,
      projects: projects.filter(
        (project) => project.category === group.category,
      ),
    }));

    const uniqueCategories = groupedData.map((group) => group.id);

    return {
      categories: uniqueCategories,
      projectsByCategory: groupedData,
    };
  }),
});
