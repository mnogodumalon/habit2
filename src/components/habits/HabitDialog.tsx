import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Habit, HabitCategory } from './HabitCard';

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSave: (data: { name: string; category: HabitCategory }) => void;
}

const categories: { value: HabitCategory; label: string }[] = [
  { value: 'health', label: 'Gesundheit' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'mindfulness', label: 'Achtsamkeit' },
  { value: 'productivity', label: 'Produktivität' },
  { value: 'learning', label: 'Lernen' },
];

export function HabitDialog({ open, onOpenChange, habit, onSave }: HabitDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setCategory(habit.category);
    } else {
      setName('');
      setCategory('health');
    }
  }, [habit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), category });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {habit ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
            </DialogTitle>
            <DialogDescription>
              {habit
                ? 'Ändere die Details deiner Gewohnheit.'
                : 'Füge eine neue tägliche Gewohnheit hinzu, die du verfolgen möchtest.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. 30 Minuten lesen"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as HabitCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {habit ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
