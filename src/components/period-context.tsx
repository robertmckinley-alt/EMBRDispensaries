import { CalendarRange, DatabaseZap, GitCompareArrows, Store } from "lucide-react";
import type { ReactNode } from "react";
import { DrilldownDetails, type DrilldownItem } from "@/components/drilldown";
import type { PeriodContext } from "@/lib/mock-dutchie";

type PeriodContextBarProps = {
  context: PeriodContext;
};

function PeriodContextPoint({
  icon,
  label,
  value,
  note,
  items
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  items: DrilldownItem[];
}) {
  return (
    <DrilldownDetails
      className="periodContextPoint"
      title={`${label} detail`}
      description={note}
      items={items}
      summary={
        <>
          <span className="periodContextIcon">{icon}</span>
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        </>
      }
    />
  );
}

export function PeriodContextBar({ context }: PeriodContextBarProps) {
  return (
    <section className="periodContextBar" aria-label="Reporting period and data basis">
      <PeriodContextPoint
        icon={<CalendarRange size={17} aria-hidden="true" />}
        label="Current period"
        value={context.currentPeriod}
        note={context.source}
        items={[
          { label: "Current period", value: context.currentPeriod },
          { label: "Source", value: context.source }
        ]}
      />
      <PeriodContextPoint
        icon={<GitCompareArrows size={17} aria-hidden="true" />}
        label="Comparison"
        value={context.comparisonPeriod}
        note="Prior comparable period"
        items={[
          { label: "Current", value: context.currentPeriod },
          { label: "Previous", value: context.comparisonPeriod }
        ]}
      />
      <PeriodContextPoint
        icon={<DatabaseZap size={17} aria-hidden="true" />}
        label="Data basis"
        value="Net basis"
        note={context.basis}
        items={[
          { label: "Basis", value: "Net sales", note: context.basis },
          { label: "Last sync", value: context.lastSync }
        ]}
      />
      <PeriodContextPoint
        icon={<Store size={17} aria-hidden="true" />}
        label="Store coverage"
        value={context.includedStores}
        note={`Excluded: ${context.excludedStores}`}
        items={[
          { label: "Included", value: context.includedStores },
          { label: "Excluded", value: context.excludedStores }
        ]}
      />
    </section>
  );
}
