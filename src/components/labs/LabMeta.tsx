import type { LabDef } from "@/data/labs";
import { formatIsoDate } from "@/labs/_shared/date";
import Pill from "@/components/ui/Pill";

type LabMetaProps = {
  lab: LabDef;
};

const statusToneMap = {
  WIP: "wip",
  Stable: "stable",
  Archived: "archived",
} as const;

export default function LabMeta({ lab }: LabMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Pill tone={statusToneMap[lab.status]}>{lab.status}</Pill>
      <span className="text-xs text-text-muted">
        Updated {formatIsoDate(lab.lastUpdated)}
      </span>
    </div>
  );
}
