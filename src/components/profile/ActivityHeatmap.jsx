import React, { useMemo } from 'react';

const ActivityHeatmap = ({ heatmapData }) => {
  // Generate a grouped layout split by discrete months
  const monthGroups = useMemo(() => {
    const lookup = {};
    if (heatmapData) {
      heatmapData.forEach(item => {
        lookup[item.date] = item.count;
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const groups = [];
    let currentGroup = null;

    // Go back exactly 365 days
    const totalDays = 365;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today.getTime());
      d.setDate(d.getDate() - i);
      
      const mStr = d.toLocaleString('en-US', { month: 'short' });
      const mKey = `${mStr}-${d.getFullYear()}`;
      
      if (!currentGroup || currentGroup.key !== mKey) {
        currentGroup = {
          key: mKey,
          name: mStr,
          weeks: []
        };
        groups.push(currentGroup);
      }
      
      const dow = d.getDay();
      
      // If it's the first day we are tracking for this month, or a Sunday starts a new week
      if (currentGroup.weeks.length === 0 || dow === 0) {
        currentGroup.weeks.push(new Array(7).fill(null));
      }
      
      const lastWeek = currentGroup.weeks[currentGroup.weeks.length - 1];
      // Format local YYYY-MM-DD to avoid toISOString() timezone offset shifting
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dayStr}`;
      
      lastWeek[dow] = {
        date: dateString,
        count: lookup[dateString] || 0,
        fullDisplayDate: d.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
      };
    }

    return groups;
  }, [heatmapData]);

  const getColor = (count) => {
    if (count === 0) return 'bg-[#161b22] border-[1px] border-white/5';
    if (count === 1) return 'bg-[#0e4429] border-[#0e4429]';
    if (count <= 3) return 'bg-[#006d32] border-[#006d32]';
    if (count <= 5) return 'bg-[#26a641] border-[#26a641] shadow-[0_0_5px_rgba(38,166,65,0.4)]';
    return 'bg-[#39d353] border-[#39d353] shadow-[0_0_8px_rgba(57,211,83,0.6)] text-black';
  };

  return (
    <div className="p-4 md:p-6 rounded-2xl border border-white/10 bg-[#0d1117] h-full flex flex-col">
      <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Activity
      </h2>

      {/* Wrapping in an overflow block with high top-padding for safe Tooltip floating  */}
      <div className="flex-1 overflow-x-auto no-scrollbar pb-2 pt-10 relative max-w-full">
        {/* monthGroups render horizontally */}
        <div className="flex gap-4 md:gap-5 pb-4 min-w-max">
          
          {monthGroups.map(month => (
            <div key={month.key} className="flex flex-col">
              
              {/* Core Weeks Grid */}
              <div className="flex gap-[4px]">
                {month.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[4px]">
                    {week.map((day, dIdx) => {
                      if (!day) {
                        return <div key={`empty-${dIdx}`} style={{ width: '14px', height: '14px' }} className="bg-transparent" />;
                      }

                      return (
                        <div key={day.date} className="relative group">
                          <div 
                            style={{ width: '14px', height: '14px' }}
                            className={`rounded-[2px] transition-all duration-300 cursor-pointer hover:scale-[1.15] ${getColor(day.count)}`}
                          />
                          {/* Interactive Tooltip safely above the grids */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-[#161b22] border border-white/10 rounded-lg shadow-xl shadow-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <p className="text-[11px] font-bold text-white mb-1 whitespace-nowrap">
                              {day.count} {day.count === 1 ? 'submission' : 'submissions'}
                            </p>
                            <p className="text-[9px] text-white/40 font-mono text-center whitespace-nowrap">
                              {day.fullDisplayDate}
                            </p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Month label at the end of the block matching Leetcode spacing */}
              <span className="text-[11px] font-semibold text-white/40 font-mono tracking-wider mt-3 text-center">
                {month.name}
              </span>
            </div>
          ))}

        </div>
      </div>

      {/* Tracker Status Legend */}
      <div className="flex items-center justify-end gap-2 text-[10px] text-white/40 uppercase font-bold tracking-widest mt-4">
        Less
        <div className="flex gap-1.5">
          <div className="w-[14px] h-[14px] rounded-[2px] bg-[#161b22] border-[1px] border-white/5" />
          <div className="w-[14px] h-[14px] rounded-[2px] bg-[#0e4429] border-[#0e4429]" />
          <div className="w-[14px] h-[14px] rounded-[2px] bg-[#006d32] border-[#006d32]" />
          <div className="w-[14px] h-[14px] rounded-[2px] bg-[#26a641] border-[#26a641]" />
          <div className="w-[14px] h-[14px] rounded-[2px] bg-[#39d353] border-[#39d353]" />
        </div>
        More
      </div>
    </div>
  );
};

export default ActivityHeatmap;
