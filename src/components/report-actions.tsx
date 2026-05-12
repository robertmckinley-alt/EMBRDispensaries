"use client";

import { Download } from "lucide-react";

export function ReportActions() {
  return (
    <button className="iconTextButton printHidden" type="button" onClick={() => window.print()}>
      <Download size={17} />
      Export PDF
    </button>
  );
}
