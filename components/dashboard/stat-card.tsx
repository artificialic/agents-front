interface StatCardProps {
  label: string;
  value: number;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

export function StatCard({
  label,
  value,
  bgColor = 'from-blue-50 to-blue-100',
  textColor = 'blue',
  borderColor = 'blue-200'
}: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-lg p-4 border border-${borderColor}`}>
      <div className={`text-sm font-medium text-${textColor}-600 mb-1`}>{label}</div>
      <div className={`text-3xl font-bold text-${textColor}-900`}>{value}</div>
    </div>
  );
}
