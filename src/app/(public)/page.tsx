import AboutSection from "@/components/portfolio/AboutSection";
import BlogSection from "@/components/portfolio/BlogSection";
import ContactSection from "@/components/portfolio/ContactSection";
import ProfileSection from "@/components/portfolio/ProfileSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import SkillsSection from "@/components/portfolio/Skills";
import { api } from "@/trpc/server";

export default async function Home() {
  const { categories, projectsByCategory } =
    await api.portfolio.getProjectsGroupedByCategory();
  return (
    <main>
      <ProfileSection />
      <AboutSection />
      {/* @ts-expect-error Server Component */}
      <SkillsSection />
      <ProjectsSection
        categories={categories}
        projectsByCategory={projectsByCategory}
        initialCategory={
          categories && categories.length > 0 ? categories[0] : ""
        }
      />
      {/* @ts-expect-error Server Component */}
      <BlogSection />
      <ContactSection />
    </main>
  );
}
