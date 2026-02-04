import { Flame, Check, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type HabitCategory = 'health' | 'fitness' | 'mindfulness' | 'productivity' | 'learning';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  streak: number;
  completedToday: boolean;
}

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const categoryConfig: Record<HabitCategory, { label: string; colorClass: string }> = {
  health: { label: 'Gesundheit', colorClass: 'bg-category-health' },
  fitness: { label: 'Fitness', colorClass: 'bg-category-fitness' },
  mindfulness: { label: 'Achtsamkeit', colorClass: 'bg-category-mindfulness' },
  productivity: { label: 'Produktivität', colorClass: 'bg-category-productivity' },
  learning: { label: 'Lernen', colorClass: 'bg-category-learning' },
};

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const category = categoryConfig[habit.category];

  return (
    <Card className={cn(
      'card-elevated transition-all duration-200',
      habit.completedToday && 'ring-2 ring-primary/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => onToggle(habit.id)}
              className={cn(
                'mt-0.5 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                habit.completedToday
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground/30 hover:border-primary/50'
              )}
            >
              {habit.completedToday && (
                <Check className="h-4 w-4 text-primary-foreground" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-medium truncate transition-all duration-200',
                habit.completedToday && 'text-muted-foreground line-through'
              )}>
                {habit.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground',
                  category.colorClass
                )}>
                  {category.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {habit.streak > 0 && (
              <div className="streak-badge flex items-center gap-1 px-2 py-1 rounded-full text-sm">
                <Flame className="h-4 w-4" />
                <span>{habit.streak}</span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(habit.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
