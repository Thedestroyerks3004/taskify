import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { CalendarMonthView } from './components/CalendarMonthView';
import { CalendarDayView } from './components/CalendarDayView';
import { FocusMode } from './components/FocusMode';
import { GoalTracker } from './components/GoalTracker';
import { TaskListView } from './components/TaskListView';
import { TaskModal } from './components/TaskModal';
import { Moon, Sun, Plus, Calendar, Target, Focus, List, Palette, Flame } from 'lucide-react';
import { Button } from './components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { Badge } from './components/ui/badge';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Category = 'work' | 'personal' | 'health' | 'social' | 'learning' | 'other';
export type ViewMode = 'month' | 'day' | 'focus' | 'goals' | 'list';
export type Theme = 'sunrise' | 'festival' | 'rainy' | 'default';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time?: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  recurring?: 'daily' | 'weekly' | 'monthly';
  reminder?: boolean;
  dependencies?: string[]; // IDs of tasks this depends on
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  month: string; // YYYY-MM
  category: Category;
}

function Sidebar({
  viewMode,
  setViewMode,
  currentTheme,
  setCurrentTheme,
  streak,
}: {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentTheme: Theme;
  setCurrentTheme: (theme: Theme) => void;
  streak: number;
}) {
  const navItems = [
    { mode: 'month' as ViewMode, icon: Calendar, label: 'Calendar' },
    { mode: 'day' as ViewMode, icon: Calendar, label: 'Daily View' },
    { mode: 'list' as ViewMode, icon: List, label: 'All Tasks' },
    { mode: 'focus' as ViewMode, icon: Focus, label: 'Focus Mode' },
    { mode: 'goals' as ViewMode, icon: Target, label: 'Goals' },
  ];

  return (
    <div className="w-64 border-r border-border bg-card p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-8 h-8 text-primary" />
        <div>
          <h2 className="font-semibold">TaskFlow</h2>
          <p className="text-xs text-muted-foreground">Smart Calendar</p>
        </div>
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-sm text-orange-500 font-medium">
              {streak} Day Streak!
            </p>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <Button
            key={item.mode}
            variant={viewMode === item.mode ? 'default' : 'ghost'}
            className="justify-start gap-2"
            onClick={() => setViewMode(item.mode)}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </label>
          <Select value={currentTheme} onValueChange={(v) => setCurrentTheme(v as Theme)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="sunrise">🌅 Sunrise</SelectItem>
              <SelectItem value="festival">🎉 Festival</SelectItem>
              <SelectItem value="rainy">🌧️ Rainy Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            TaskFlow Calendar v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [streak, setStreak] = useState(0);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDayForNewTask, setSelectedDayForNewTask] = useState<Date | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('calendar-tasks');
    const savedGoals = localStorage.getItem('calendar-goals');
    const savedDarkMode = localStorage.getItem('calendar-darkMode');
    const savedTheme = localStorage.getItem('calendar-theme');
    const savedStreak = localStorage.getItem('calendar-streak');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    if (savedTheme) setCurrentTheme(savedTheme as Theme);
    if (savedStreak) setStreak(JSON.parse(savedStreak));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('calendar-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('calendar-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('calendar-darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('calendar-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('calendar-streak', JSON.stringify(streak));
  }, [streak]);

  // Calculate streak
  useEffect(() => {
    const calculateStreak = () => {
      const today = new Date();
      let currentStreak = 0;
      let checkDate = new Date(today);

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayTasks = tasks.filter(
          t => t.date === dateStr && t.completed
        );

        if (dayTasks.length === 0) break;

        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      setStreak(currentStreak);
    };

    calculateStreak();
  }, [tasks]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36),
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(
      tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36),
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        <Sidebar
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          streak={streak}
        />

        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 glass-header px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl gradient-text">
                {viewMode === 'month' && 'Calendar'}
                {viewMode === 'day' && 'Daily View'}
                {viewMode === 'focus' && 'Focus Mode'}
                {viewMode === 'goals' && 'Goals'}
                {viewMode === 'list' && 'All Tasks'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="p-6">
            {viewMode === 'month' && (
              <CalendarMonthView
                tasks={tasks}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onToggleComplete={toggleTaskComplete}
              />
            )}

            {viewMode === 'day' && (
              <CalendarDayView
                tasks={tasks}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onToggleComplete={toggleTaskComplete}
              />
            )}

            {viewMode === 'focus' && (
              <FocusMode
                tasks={tasks}
                onToggleComplete={toggleTaskComplete}
                onUpdateTask={updateTask}
              />
            )}

            {viewMode === 'goals' && (
              <GoalTracker
                goals={goals}
                tasks={tasks}
                onAddGoal={addGoal}
                onUpdateGoal={updateGoal}
                onDeleteGoal={deleteGoal}
              />
            )}

            {viewMode === 'list' && (
              <TaskListView
                tasks={tasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onToggleComplete={toggleTaskComplete}
              />
            )}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => {
            setSelectedDayForNewTask(new Date());
            setEditingTask(null);
            setTaskModalOpen(true);
          }}
          className="fab"
          aria-label="Quick add task"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <Toaster />

      {/* Global Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
          setSelectedDayForNewTask(null);
        }}
        onSave={(task) => {
          if (editingTask) {
            updateTask(editingTask.id, task);
          } else {
            addTask(task);
          }
          setTaskModalOpen(false);
          setEditingTask(null);
          setSelectedDayForNewTask(null);
        }}
        task={editingTask}
        initialDate={selectedDayForNewTask}
        allTasks={tasks}
      />
    </div>
  );
}

export default App;
