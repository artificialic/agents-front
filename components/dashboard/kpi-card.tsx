interface KPICardProps {
  title: string;
  value: number;
  total: number;
  icon?: string;
  gradient?: string;
}

export function KPICard({
  title,
  value,
  total,
  icon = '✓',
  gradient = 'from-emerald-500 to-teal-500'
}: KPICardProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-90 mb-1">{title}</div>
          <div className="text-4xl font-bold">{value}</div>
          <div className="text-sm opacity-75 mt-1">de {total} finalizadas</div>
        </div>
        <div className="text-6xl opacity-20">{icon}</div>
      </div>
      <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs mt-2 opacity-75">
        {percentage.toFixed(1)}% del total
      </div>
    </div>
  );
}
