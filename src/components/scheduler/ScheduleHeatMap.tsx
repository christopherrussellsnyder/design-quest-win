interface ScheduleHeatMapProps {
  heatMapData: number[][];
  onSelectTime: (time: string) => void;
}

export function ScheduleHeatMap({ heatMapData, onSelectTime }: ScheduleHeatMapProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getColor = (value: number) => {
    if (value === 0) return 'bg-muted';
    if (value < 2) return 'bg-red-900/40';
    if (value < 3) return 'bg-yellow-900/40';
    if (value < 4) return 'bg-green-900/40';
    return 'bg-green-600/60';
  };
  
  const handleCellClick = (day: number, hour: number) => {
    const now = new Date();
    const targetDate = new Date(now);
    const daysToAdd = (day - now.getDay() + 7) % 7 || 7;
    targetDate.setDate(now.getDate() + daysToAdd);
    targetDate.setHours(hour, 0, 0, 0);
    onSelectTime(targetDate.toISOString());
  };
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <h3 className="text-foreground font-semibold mb-2">Engagement Heat Map</h3>
      <p className="text-xs text-muted-foreground mb-4">Click any cell to schedule at that time</p>
      
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-0.5">
            {/* Header row */}
            <div className="h-6" />
            {days.map(day => (
              <div key={day} className="h-6 flex items-center justify-center text-xs text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            
            {/* Data rows */}
            {hours.map(hour => (
              <div key={hour} className="contents">
                <div className="h-4 flex items-center pr-2 text-xs text-muted-foreground">
                  {hour % 12 || 12}{hour < 12 ? 'am' : 'pm'}
                </div>
                {days.map((_, dayIdx) => {
                  const value = heatMapData?.[dayIdx]?.[hour] || 0;
                  return (
                    <div 
                      key={`${dayIdx}-${hour}`}
                      className={`h-4 rounded-sm cursor-pointer hover:ring-1 hover:ring-primary transition-all ${getColor(value)}`}
                      onClick={() => handleCellClick(dayIdx, hour)}
                      title={`${days[dayIdx]} ${hour}:00 - ${value.toFixed(1)}% engagement`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span className="text-muted-foreground">No data</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-900/40" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-900/40" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-600/60" />
          <span className="text-muted-foreground">High</span>
        </div>
      </div>
    </div>
  );
}
