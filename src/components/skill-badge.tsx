import { SKILL_ICONS } from "@/lib/skill-icons";
import { Badge } from "@/components/ui/badge";

interface SkillBadgeProps {
  skill: string;
}

export function SkillBadge({ skill }: SkillBadgeProps) {
  const Icon = SKILL_ICONS[skill.toLowerCase()];
  return (
    <Badge className="gap-1.5 px-2.5 py-0.5">
      {Icon && <Icon className="size-3 shrink-0" style={{ color: "inherit" }} />}
      {skill}
    </Badge>
  );
}
