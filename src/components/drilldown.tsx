import type { ReactNode } from "react";

export type DrilldownItem = {
  label: string;
  value: string;
  note?: string;
};

type DrilldownDetailsProps = {
  className?: string;
  title: string;
  description?: string;
  summary: ReactNode;
  items?: DrilldownItem[];
  children?: ReactNode;
};

type DataPointDrilldownProps = {
  className?: string;
  label: string;
  value: string;
  note?: string;
  items?: DrilldownItem[];
  children?: ReactNode;
};

export function DrilldownDetails({
  className,
  title,
  description,
  summary,
  items = [],
  children
}: DrilldownDetailsProps) {
  return (
    <details className={["drilldownDetails", className].filter(Boolean).join(" ")}>
      <summary>{summary}</summary>
      <div className="drilldownBody">
        <div className="drilldownIntro">
          <strong>{title}</strong>
          {description ? <p>{description}</p> : null}
        </div>
        {items.length > 0 ? (
          <dl className="drilldownList">
            {items.map((item, index) => (
              <div key={`${item.label}-${item.value}-${index}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
    </details>
  );
}

export function DataPointDrilldown({
  className,
  label,
  value,
  note,
  items = [],
  children
}: DataPointDrilldownProps) {
  return (
    <details className={["dataPointDrilldown", className].filter(Boolean).join(" ")}>
      <summary>
        <span>{label}</span>
        <strong>{value}</strong>
        {note ? <small>{note}</small> : null}
      </summary>
      <div className="drilldownBody compact">
        {items.length > 0 ? (
          <dl className="drilldownList compact">
            {items.map((item, index) => (
              <div key={`${item.label}-${item.value}-${index}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            ))}
          </dl>
        ) : null}
        {children}
      </div>
    </details>
  );
}
