import { useState, useEffect } from 'react';
import { Task } from '../App';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FocusModeProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export function FocusMode({
  tasks,
  onToggleComplete,
  onUpdateTask,
}: FocusModeProps) {
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks
    .filter(t => t.date === today && !t.completed)
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const completedToday = tasks.filter(t => t.date === today && t.completed).length;
  const totalToday = tasks.filter(t => t.date === today).length;
  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsRunning(false);
      if (isBreak) {
        toast.success('Break finished! Ready to focus again?');
        setPomodoroTime(25 * 60);
        setIsBreak(false);
      } else {
        setCompletedPomodoros(prev => prev + 1);
        toast.success('Pomodoro completed! Time for a break.');
        setPomodoroTime(5 * 60); // 5 minute break
        setIsBreak(true);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, pomodoroTime, isBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPomodoroTime(isBreak ? 5 * 60 : 25 * 60);
  };

  const skipTimer = () => {
    setPomodoroTime(0);
  };

  const timerProgress = isBreak
    ? ((5 * 60 - pomodoroTime) / (5 * 60)) * 100
    : ((25 * 60 - pomodoroTime) / (25 * 60)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Focus Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl">Focus Mode</h2>
        <p className="text-muted-foreground">
          Minimize distractions and get things done
        </p>
      </div>

      {/* Pomodoro Timer */}
      <div className="p-8 bg-card border border-border rounded-xl space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <div className={`w-3 h-3 rounded-full ${isBreak ? 'bg-green-500' : 'bg-primary'} ${isRunning ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </span>
          </div>

          <div className="text-7xl font-mono tabular-nums">
            {formatTime(pomodoroTime)}
          </div>

          <Progress value={timerProgress} className="h-2" />

          <div className="flex items-center justify-center gap-2">
            <Button
              size="lg"
              onClick={toggleTimer}
              className="w-32"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={resetTimer}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={skipTimer}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{completedPomodoros}</span> Pomodoros
            </div>
            <div>•</div>
            <div>
              <span className="font-medium text-foreground">{completedToday}</span> / {totalToday} Tasks
            </div>
          </div>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="p-6 bg-card border border-border rounded-lg space-y-3">
        <h3 className="font-medium">Today's Progress</h3>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {completedToday} of {totalToday} tasks completed ({Math.round(progressPercentage)}%)
        </p>
      </div>

      {/* Current Task Focus */}
      {todayTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Next Up</h3>
          <TaskCard
            task={todayTasks[0]}
            onToggleComplete={() => onToggleComplete(todayTasks[0].id)}
          />
        </div>
      )}

      {/* Remaining Tasks */}
      {todayTasks.length > 1 && (
        <div className="space-y-3">
          <h3 className="font-medium text-muted-foreground">
            Upcoming ({todayTasks.length - 1})
          </h3>
          <div className="space-y-2 opacity-60">
            {todayTasks.slice(1, 4).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={() => onToggleComplete(task.id)}
              />
            ))}
          </div>
          {todayTasks.length > 4 && (
            <p className="text-sm text-muted-foreground text-center">
              + {todayTasks.length - 4} more tasks
            </p>
          )}
        </div>
      )}

      {todayTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-xl">🎉 All tasks completed for today!</p>
          <p className="mt-2">Great job! Take a well-deserved break.</p>
        </div>
      )}
    </div>
  );
}
