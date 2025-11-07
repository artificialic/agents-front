interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  showLegend?: boolean;
}

export function PieChart({ data, size = 64, showLegend = true }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const pieSlices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      percentage,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className={`w-${size} h-${size}`}>
        {pieSlices.map((slice, index) => (
          <g key={index}>
            <path d={slice.path} fill={slice.color} opacity="0.9" />
            <text
              x="50"
              y={50 + (index - pieSlices.length / 2 + 0.5) * 8}
              textAnchor="middle"
              className="text-[4px] font-semibold fill-gray-700"
            >
              {slice.percentage.toFixed(1)}%
            </text>
          </g>
        ))}
        <circle cx="50" cy="50" r="20" fill="white" />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="text-[6px] font-bold fill-gray-900"
        >
          {total}
        </text>
        <text
          x="50"
          y="54"
          textAnchor="middle"
          className="text-[3px] fill-gray-600"
        >
          Total
        </text>
      </svg>

      {showLegend && (
        <div className="mt-4 space-y-2 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
