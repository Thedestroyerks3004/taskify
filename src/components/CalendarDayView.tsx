import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Task } from '../App';
import { TaskModal } from './TaskModal';
import { TaskCard } from './TaskCard';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';

interface CalendarDayViewProps {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function CalendarDayView({
  tasks,
  selectedDate,
  setSelectedDate,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
}: CalendarDayViewProps) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayTasks = tasks.filter(t => t.date === dateStr);
  const completedTasks = dayTasks.filter(t => t.completed).length;
  const totalTasks = dayTasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, task);
    } else {
      onAddTask(task);
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  // Group tasks by time
  const tasksWithTime = dayTasks
    .filter(t => t.time)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const tasksWithoutTime = dayTasks.filter(t => !t.time);

  // Organize by priority
  const urgentTasks = dayTasks.filter(t => t.priority === 'urgent' && !t.completed);
  const highTasks = dayTasks.filter(t => t.priority === 'high' && !t.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-[300px] text-center">
            <h2 className="text-2xl">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h2>
          </div>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress */}
      {totalTasks > 0 && (
        <div className="space-y-2 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span>Daily Progress</span>
            <span className="text-muted-foreground">
              {completedTasks} / {totalTasks} tasks completed
            </span>
          </div>
          <Progress value={completionPercentage} />
        </div>
      )}

      {/* Urgent & High Priority Tasks */}
      {(urgentTasks.length > 0 || highTasks.length > 0) && (
        <div className="space-y-3">
          {urgentTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-500">Urgent Tasks</h3>
              <div className="space-y-2">
                {urgentTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleEditTask(task)}
                    onToggleComplete={() => onToggleComplete(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {highTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-orange-500">High Priority</h3>
              <div className="space-y-2">
                {highTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleEditTask(task)}
                    onToggleComplete={() => onToggleComplete(task.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scheduled Tasks (with time) */}
      {tasksWithTime.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Scheduled Tasks</h3>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {tasksWithTime.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleEditTask(task)}
                  onToggleComplete={() => onToggleComplete(task.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Other Tasks (without time) */}
      {tasksWithoutTime.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">All Day Tasks</h3>
          <div className="space-y-2">
            {tasksWithoutTime.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleEditTask(task)}
                onToggleComplete={() => onToggleComplete(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {dayTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tasks scheduled for this day.</p>
          <Button variant="link" onClick={handleAddTask} className="mt-2">
            Add your first task
          </Button>
        </div>
      )}

      <TaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        initialDate={selectedDate}
        allTasks={tasks}
      />
    </div>
  );
}
