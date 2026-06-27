"use client";

import { useState } from "react";
import { TrendingUp, ShoppingBag, DollarSign, Calendar, Info } from "lucide-react";

interface DataPoint {
  month: string;
  label: string;
  revenue: number;
  count: number;
}

export function AnalyticsCharts({ data, isDemo }: { data: DataPoint[]; isDemo: boolean }) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [activeTab, setActiveTab] = useState<"revenue" | "orders">("revenue");

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart configuration
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate scales
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1000);
  const maxOrders = Math.max(...data.map(d => d.count), 5);

  const activeMax = activeTab === "revenue" ? maxRevenue : maxOrders;

  // Generate SVG coordinates
  const points = data.map((d, idx) => {
    const val = activeTab === "revenue" ? d.revenue : d.count;
    const x = paddingLeft + (idx / (data.length - 1)) * graphWidth;
    const y = chartHeight - paddingBottom - (val / activeMax) * graphHeight;
    return { x, y, data: d };
  });

  // Area path (from first point, to last, then back to bottom y=chartHeight-paddingBottom)
  const linePath = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";
    
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : "";

  return (
    <div className="space-y-8">
      {isDemo && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-3 text-xs font-semibold">
          <Info className="size-4 flex-shrink-0" />
          <span>Demo Mode active: Showing simulated e-commerce revenue data since no real shop sales were found in the database.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Sales Revenue</span>
            <DollarSign className="size-4 text-accent" />
          </div>
          <div className="text-3xl font-extrabold font-syne">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Aggregated rolling period</div>
        </div>

        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Orders</span>
            <ShoppingBag className="size-4 text-accent" />
          </div>
          <div className="text-3xl font-extrabold font-syne">{totalOrders.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Customer checkouts completed</div>
        </div>

        <div className="p-6 rounded-2xl glass border border-glass-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Average Order Value</span>
            <TrendingUp className="size-4 text-accent" />
          </div>
          <div className="text-3xl font-extrabold font-syne">${averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Revenue generated per sale</div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="p-6 rounded-2xl glass border border-glass-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold font-syne">Financial Performance</h3>
            <p className="text-xs text-muted-foreground">Monthly breakdown of gross volume and purchase counts</p>
          </div>

          <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-glass-border w-fit">
            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "revenue" 
                  ? "bg-accent text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "orders" 
                  ? "bg-accent text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Order Count
            </button>
          </div>
        </div>

        {/* Responsive Chart Graphic */}
        <div className="relative h-64 w-full select-none">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + ratio * graphHeight;
              const val = activeMax * (1 - ratio);
              return (
                <g key={ratio} className="opacity-30">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="var(--glass-border)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-muted-foreground"
                  >
                    {activeTab === "revenue" 
                      ? `$${Math.round(val).toLocaleString()}` 
                      : Math.round(val)}
                  </text>
                </g>
              );
            })}

            {/* Area and Line for Revenue / Line for Orders */}
            {points.length > 0 && (
              <>
                <path
                  d={areaPath}
                  fill="url(#chart-gradient)"
                  className="transition-all duration-500"
                />
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              </>
            )}

            {/* Y and X Axis baselines */}
            <line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke="var(--glass-border)"
              strokeWidth="1.5"
            />

            {/* X Labels */}
            {data.map((d, idx) => {
              const x = paddingLeft + (idx / (data.length - 1)) * graphWidth;
              return (
                <text
                  key={idx}
                  x={x}
                  y={chartHeight - paddingBottom + 16}
                  textAnchor="middle"
                  className="text-[9px] font-bold font-mono fill-muted-foreground"
                >
                  {d.label}
                </text>
              );
            })}

            {/* Interactivity Overlay Circles */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.month === p.data.month ? "6" : "3.5"}
                onMouseEnter={() => setHoveredPoint(p.data)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="fill-accent stroke-background stroke-2 transition-all duration-150 cursor-pointer"
              />
            ))}
          </svg>

          {/* Floating HTML Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-glass backdrop-blur-md border border-glass-border p-3 rounded-xl shadow-xl text-[11px] font-semibold space-y-1 z-30 pointer-events-none"
              style={{
                left: `${Math.min(
                  Math.max(
                    (data.findIndex(d => d.month === hoveredPoint.month) / (data.length - 1)) * 95,
                    5
                  ),
                  75
                )}%`,
                top: "10%",
              }}
            >
              <div className="text-muted-foreground font-mono">{hoveredPoint.label}</div>
              <div className="font-bold flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-accent"></span>
                <span>Revenue: <span className="text-foreground font-mono">${hoveredPoint.revenue.toFixed(2)}</span></span>
              </div>
              <div className="font-bold flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-accent"></span>
                <span>Orders: <span className="text-foreground font-mono">{hoveredPoint.count}</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabular Ledger Section */}
      <div className="space-y-4">
        <h3 className="font-bold font-syne text-lg">Sales Ledger</h3>
        <div className="rounded-2xl border border-glass-border glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-glass-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider">Month / Period</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider">Gross Revenue</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider">Completed Orders</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-wider">Avg Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {data.slice().reverse().map((item, idx) => {
                  const avg = item.count > 0 ? item.revenue / item.count : 0;
                  return (
                    <tr key={idx} className="hover:bg-glass-highlight transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs">{item.label}</td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold">${item.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{item.count} sales</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">${avg.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
