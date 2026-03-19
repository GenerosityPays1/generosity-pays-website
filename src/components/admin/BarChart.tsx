"use client";

import React, { useState, useMemo } from "react";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
  className?: string;
}

export default function BarChart({
  data,
  height = 200,
  barColor = "#2563eb",
  className = "",
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => d.value), 1);
  }, [data]);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-gray-400 text-sm ${className}`}
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 60, left: 20 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const barGap = 8;
  const barWidth = Math.max(
    4,
    (innerWidth - barGap * (data.length - 1)) / data.length
  );
  const rotateLabels = data.length > 6;

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Bars */}
        {data.map((item, idx) => {
          const barHeight = (item.value / maxValue) * innerHeight;
          const x =
            padding.left + idx * (barWidth + barGap) + barGap / 2;
          const y = padding.top + innerHeight - barHeight;
          const isHovered = hoveredIndex === idx;

          return (
            <g key={idx}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={Math.min(4, barWidth / 2)}
                fill={barColor}
                opacity={isHovered ? 1 : 0.85}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="transition-all duration-300"
                style={{
                  transform: `scaleY(1)`,
                  transformOrigin: `${x + barWidth / 2}px ${padding.top + innerHeight}px`,
                }}
              >
                <title>{`${item.label}: ${item.value}`}</title>
                <animate
                  attributeName="height"
                  from="0"
                  to={barHeight}
                  dur="0.6s"
                  fill="freeze"
                />
                <animate
                  attributeName="y"
                  from={padding.top + innerHeight}
                  to={y}
                  dur="0.6s"
                  fill="freeze"
                />
              </rect>

              {/* Hover tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 24}
                    y={y - 28}
                    width={48}
                    height={22}
                    rx={4}
                    fill="#0f172a"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 14}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {item.value}
                  </text>
                </g>
              )}

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={padding.top + innerHeight + (rotateLabels ? 12 : 18)}
                textAnchor={rotateLabels ? "end" : "middle"}
                fill="#6b7280"
                fontSize="11"
                transform={
                  rotateLabels
                    ? `rotate(-45, ${x + barWidth / 2}, ${padding.top + innerHeight + 12})`
                    : undefined
                }
              >
                {item.label.length > 10
                  ? item.label.slice(0, 9) + "..."
                  : item.label}
              </text>
            </g>
          );
        })}

        {/* Bottom axis line */}
        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={padding.left + innerWidth + barGap}
          y2={padding.top + innerHeight}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
