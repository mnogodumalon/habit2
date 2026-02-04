import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay, getWeek, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HabitCompletion {
  date: string;
  count: number;
}

interface YearlyHeatmapProps {
  completions: HabitCompletion[];
  year: number;
  onDayClick?: (date: string) => void;
}

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const levelColors: Record<number, string> = {
  0: 'bg-habit-empty',
  1: 'bg-habit-level-1',
  2: 'bg-habit-level-2',
  3: 'bg-habit-level-3',
  4: 'bg-habit-level-4',
};

const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function YearlyHeatmap({ completions, year, onDayClick }: YearlyHeatmapProps) {
  const completionMap = useMemo(() => {
    const map = new Map<string, number>();
    completions.forEach(c => map.set(c.date, c.count));
    return map;
  }, [completions]);

  const days = useMemo(() => {
    const start = startOfYear(new Date(year, 0, 1));
    const end = endOfYear(new Date(year, 0, 1));
    return eachDayOfInterval({ start, end });
  }, [year]);

  const weeks = useMemo(() => {
    const weeksMap: Map<number, Date[]> = new Map();
    days.forEach(day => {
      const weekNum = getWeek(day, { weekStartsOn: 1 });
      if (!weeksMap.has(weekNum)) {
        weeksMap.set(weekNum, []);
      }
      weeksMap.get(weekNum)!.push(day);
    });
    return Array.from(weeksMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [days]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* Month labels */}
          <div className="flex mb-2 ml-8">
            {months.map((month) => (
              <div
                key={month}
                className="text-xs text-muted-foreground"
                style={{ width: `${(100/12)}%`, minWidth: '40px' }}
              >
                {month}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Weekday labels */}
            <div className="flex flex-col gap-0.5 mr-2 text-xs text-muted-foreground">
              {weekdays.map((day, i) => (
                <div key={day} className="h-3 w-6 flex items-center justify-end pr-1">
                  {i % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {weeks.map(([weekNum, weekDays]) => (
                <div key={weekNum} className="flex flex-col gap-0.5">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    // Convert to Monday-first index
                    const mondayFirstIndex = dayIndex;
                    const day = weekDays.find(d => {
                      const dayOfWeek = getDay(d);
                      // Convert Sunday (0) to 6, others shift down by 1
                      const mondayBasedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                      return mondayBasedIndex === mondayFirstIndex;
                    });

                    if (!day) {
                      return <div key={dayIndex} className="h-3 w-3" />;
                    }

                    const dateStr = format(day, 'yyyy-MM-dd');
                    const count = completionMap.get(dateStr) || 0;
                    const level = getLevel(count);

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onDayClick?.(dateStr)}
                            className={cn(
                              'h-3 w-3 habit-cell',
                              levelColors[level],
                              isToday(day) && 'ring-2 ring-primary ring-offset-1'
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">
                            {format(day, 'EEEE, d. MMMM yyyy', { locale: de })}
                          </p>
                          <p className="text-muted-foreground">
                            {count === 0
                              ? 'Keine Gewohnheiten erledigt'
                              : `${count} Gewohnheit${count === 1 ? '' : 'en'} erledigt`
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Weniger</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={cn('h-3 w-3 rounded-sm', levelColors[level])}
              />
            ))}
            <span>Mehr</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
