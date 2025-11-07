interface BarChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  gradient?: string;
  showPercentage?: boolean;
  totalForPercentage?: number;
}

export function BarChart({
  data,
  gradient = 'from-blue-500 to-blue-600',
  showPercentage = true,
  totalForPercentage
}: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const total = totalForPercentage || data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{item.name}</span>
            <span className="font-semibold text-gray-900">{item.value}</span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            >
              {showPercentage && (
                <span className="text-xs font-semibold text-white">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
