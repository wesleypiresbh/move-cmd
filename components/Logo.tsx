export function Logo({ className = "w-32", type = "passageiro" }: { className?: string, type?: 'admin' | 'motorista' | 'passageiro' }) {
  const getThemeColor = () => {
    switch (type) {
      case 'admin': return '#10B981'; // emerald-500
      case 'motorista': return '#2563EB'; // blue-600
      case 'passageiro':
      default: return '#f97316'; // orange-500
    }
  };

  const themeColor = getThemeColor();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Speed lines */}
        <path d="M40 50 L60 50" stroke={themeColor} strokeWidth="8" strokeLinecap="round" />
        <path d="M25 65 L55 65" stroke={themeColor} strokeWidth="8" strokeLinecap="round" />
        <path d="M35 80 L55 80" stroke={themeColor} strokeWidth="8" strokeLinecap="round" />
        
        {/* M Left (Black) */}
        <path d="M65 90 L80 30 C82 20, 95 20, 98 30 L110 60 L125 75 L115 90 L95 70 L85 90 Z" fill="#111827" />
        
        {/* M Right (Dynamic Color) */}
        <path d="M110 60 L135 30 C140 20, 155 20, 150 35 L135 90 L115 90 L125 75 Z" fill={themeColor} />
      </svg>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-2xl font-black italic text-gray-900 tracking-tighter">Move</span>
        <span className="text-2xl font-black italic tracking-tighter" style={{ color: themeColor }}>-CMD</span>
      </div>
    </div>
  );
}
