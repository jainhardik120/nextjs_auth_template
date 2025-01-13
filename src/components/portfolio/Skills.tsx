import SkillCard from "./SkillCard";
import { api } from "@/trpc/server";

export default async function SkillsSection() {
  const skills = await api.portfolio.getSkills();
  return (
    <section id="skills" className=" container mx-auto px-12 py-20">
      <h2 className="text-center text-4xl font-bold mb-12">Skills</h2>
      <div className="mx-auto overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 ">
          {skills.map((skillSet, index) => (
            <SkillCard key={index} skill={skillSet} />
          ))}
        </div>
      </div>
    </section>
  );
}
