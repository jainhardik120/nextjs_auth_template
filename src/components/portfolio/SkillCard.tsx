import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skill, SubSkill } from "@prisma/client";
import { BadgeCheck } from "lucide-react";

const SkillCard: React.FC<{ skill: Skill & { skills: SubSkill[] } }> = ({
  skill,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{skill.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {skill.skills.map((subskill, index) => {
          return (
            <div key={index} className="flex items-center my-2">
              <BadgeCheck className="w-6 h-6 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">{subskill.name}</h3>
                <span className="text-sm text-tsecondary-light dark:text-tsecondary-dark">
                  {subskill.level}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SkillCard;
