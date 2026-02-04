import { useState, useMemo } from 'react';
import { format, subDays, startOfYear } from 'date-fns';
import { de } from 'date-fns/locale';
import { Plus, Flame, Target, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YearlyHeatmap } from '@/components/habits/YearlyHeatmap';
import { HabitCard, type Habit, type HabitCategory } from '@/components/habits/HabitCard';
import { HabitDialog } from '@/components/habits/HabitDialog';
import { StatsCard } from '@/components/habits/StatsCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Sample data for demonstration
const sampleHabits: Habit[] = [
  { id: '1', name: 'Morgens meditieren', category: 'mindfulness', streak: 12, completedToday: true },
  { id: '2', name: '10.000 Schritte gehen', category: 'fitness', streak: 5, completedToday: false },
  { id: '3', name: '2 Liter Wasser trinken', category: 'health', streak: 28, completedToday: true },
  { id: '4', name: '30 Minuten lesen', category: 'learning', streak: 7, completedToday: false },
  { id: '5', name: 'Inbox Zero', category: 'productivity', streak: 3, completedToday: false },
];

// Generate sample completion data for the year
function generateSampleCompletions(year: number) {
  const completions: { date: string; count: number }[] = [];
  const today = new Date();
  const yearStart = startOfYear(new Date(year, 0, 1));

  let currentDate = yearStart;
  while (currentDate <= today) {
    // Random completion count (weighted towards lower numbers)
    const rand = Math.random();
    let count = 0;
    if (rand > 0.3) count = 1;
    if (rand > 0.5) count = 2;
    if (rand > 0.7) count = 3;
    if (rand > 0.85) count = 4;
    if (rand > 0.95) count = 5;

    completions.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      count,
    });

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return completions;
}

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const completions = useMemo(() => generateSampleCompletions(currentYear), [currentYear]);

  // Calculate stats
  const totalCompletedToday = habits.filter(h => h.completedToday).length;
  const longestStreak = Math.max(...habits.map(h => h.streak), 0);
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0
    ? Math.round((totalCompletedToday / totalHabits) * 100)
    : 0;

  const handleToggleHabit = (id: string) => {
    setHabits(prev => prev.map(habit =>
      habit.id === id
        ? {
            ...habit,
            completedToday: !habit.completedToday,
            streak: !habit.completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1)
          }
        : habit
    ));
  };

  const handleSaveHabit = (data: { name: string; category: HabitCategory }) => {
    if (editingHabit) {
      setHabits(prev => prev.map(h =>
        h.id === editingHabit.id
          ? { ...h, name: data.name, category: data.category }
          : h
      ));
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: data.name,
        category: data.category,
        streak: 0,
        completedToday: false,
      };
      setHabits(prev => [...prev, newHabit]);
    }
    setEditingHabit(null);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setDeleteId(null);
  };

  const handleOpenNewDialog = () => {
    setEditingHabit(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Gewohnheitstracker
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Heute erledigt"
            value={`${totalCompletedToday}/${totalHabits}`}
            icon={<Target className="h-5 w-5" />}
            description={`${completionRate}% abgeschlossen`}
          />
          <StatsCard
            title="Längster Streak"
            value={longestStreak}
            icon={<Flame className="h-5 w-5" />}
            description="Tage in Folge"
          />
          <StatsCard
            title="Aktive Gewohnheiten"
            value={totalHabits}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatsCard
            title="Diese Woche"
            value="85%"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
        </div>

        {/* Yearly Overview */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Jahresübersicht {currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <YearlyHeatmap
              completions={completions}
              year={currentYear}
              onDayClick={(date) => console.log('Clicked:', date)}
            />
          </CardContent>
        </Card>

        {/* Habits Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Deine Gewohnheiten</h2>
            <Button onClick={handleOpenNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Gewohnheit
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggleHabit}
                onEdit={handleEditHabit}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>

          {habits.length === 0 && (
            <Card className="card-elevated">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Keine Gewohnheiten</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Erstelle deine erste Gewohnheit um loszulegen.
                </p>
                <Button onClick={handleOpenNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Gewohnheit erstellen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <HabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        onSave={handleSaveHabit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gewohnheit löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Gewohnheit und
              alle zugehörigen Daten werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeleteHabit(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
