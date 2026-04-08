import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ProfileCharts = ({ difficulty }) => {
  if (!difficulty) return null;

  const data = [
    { name: 'Easy', value: difficulty.easy || 0, color: '#10b981' }, // Emerald
    { name: 'Medium', value: difficulty.medium || 0, color: '#f59e0b' }, // Amber
    { name: 'Hard', value: difficulty.hard || 0, color: '#f43f5e' }, // Rose
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl">
          <p className="text-[11px] font-bold text-white mb-1">
            {payload[0].name}
          </p>
          <p className="text-[10px] text-white/50 font-mono">
            Count: <span className="text-white font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-[#121826]/60 backdrop-blur-md h-full flex flex-col relative focus:outline-none">
      <h2 className="text-sm font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        Difficulty
      </h2>

      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[length:24px_24px]">
          <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3">
             <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 animate-[spin_4s_linear_infinite]" />
          </div>
          <p className="text-xs text-white/30 font-semibold">No puzzles solved yet.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-xl font-black text-white">{total}</span>
             <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Solved</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-white/60 font-medium">
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCharts;
