"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ExecutiveIntelligence } from "@/lib/executive-intelligence";

type ExecutiveChartsProps = {
  data: ExecutiveIntelligence["chartData"];
};

function compactCurrency(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }

  return `$${value.toFixed(0)}`;
}

const chartMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
};

export function ExecutiveCharts({ data }: ExecutiveChartsProps) {
  return (
    <section className="executiveChartGrid" aria-label="Executive visualization system">
      <motion.div className="panel premiumChartPanel wide" {...chartMotion}>
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Executive trend</p>
            <h2>Revenue and order momentum</h2>
          </div>
          <span className="softBadge">Recharts</span>
        </div>
        <div className="premiumChart">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.revenue} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="executiveRevenue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#56d68a" stopOpacity={0.42} />
                  <stop offset="100%" stopColor="#56d68a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(244,241,232,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#8d9588" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#8d9588" tickLine={false} axisLine={false} tickFormatter={compactCurrency} />
              <YAxis yAxisId="right" orientation="right" stroke="#8d9588" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#171b18", border: "1px solid rgba(229,233,218,.14)", borderRadius: 8 }}
                formatter={(value, name) => [name === "netRevenue" ? compactCurrency(Number(value)) : Number(value).toLocaleString(), name]}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="netRevenue" name="Net revenue" stroke="#56d68a" fill="url(#executiveRevenue)" strokeWidth={2.4} />
              <Line yAxisId="right" type="monotone" dataKey="transactions" name="Orders" stroke="#5cc7d7" strokeWidth={2.2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div className="panel premiumChartPanel" {...chartMotion} transition={{ ...chartMotion.transition, delay: 0.05 }}>
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Locations</p>
            <h2>Market performance</h2>
          </div>
          <span className="softBadge">Net basis</span>
        </div>
        <div className="premiumChart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.locations} layout="vertical" margin={{ top: 6, right: 16, bottom: 0, left: 24 }}>
              <CartesianGrid stroke="rgba(244,241,232,0.08)" horizontal={false} />
              <XAxis type="number" stroke="#8d9588" tickLine={false} axisLine={false} tickFormatter={compactCurrency} />
              <YAxis type="category" dataKey="name" stroke="#8d9588" tickLine={false} axisLine={false} width={86} />
              <Tooltip
                contentStyle={{ background: "#171b18", border: "1px solid rgba(229,233,218,.14)", borderRadius: 8 }}
                formatter={(value) => compactCurrency(Number(value))}
              />
              <Bar dataKey="netRevenue" name="Net revenue" radius={[0, 6, 6, 0]}>
                {data.locations.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.status === "Action" ? "#f07f6b" : entry.status === "Watch" ? "#f3c969" : "#56d68a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div className="panel premiumChartPanel" {...chartMotion} transition={{ ...chartMotion.transition, delay: 0.1 }}>
        <div className="panelHeader">
          <div>
            <p className="eyebrow">SKU intelligence</p>
            <h2>Product revenue and margin</h2>
          </div>
          <span className="softBadge">Top 10</span>
        </div>
        <div className="premiumChart">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.products} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="productRevenue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#5cc7d7" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="#5cc7d7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(244,241,232,0.08)" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis stroke="#8d9588" tickLine={false} axisLine={false} tickFormatter={compactCurrency} />
              <Tooltip
                contentStyle={{ background: "#171b18", border: "1px solid rgba(229,233,218,.14)", borderRadius: 8 }}
                formatter={(value, name) => [name === "netRevenue" ? compactCurrency(Number(value)) : `${Number(value).toFixed(1)}%`, name]}
              />
              <Area type="monotone" dataKey="netRevenue" name="Net revenue" stroke="#5cc7d7" fill="url(#productRevenue)" strokeWidth={2.2} />
              <Line type="monotone" dataKey="margin" name="Est. margin" stroke="#f3c969" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </section>
  );
}
