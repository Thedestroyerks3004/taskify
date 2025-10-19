import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Task } from '../App';
import { TaskModal } from './TaskModal';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TaskCard } from './TaskCard';
import { motion } from 'motion/react';

interface CalendarMonthViewProps {
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

interface CalendarDayProps {
  date: Date;
  dateStr: string;
  day: number;
  tasks: Task[];
  taskLoad: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  onDayClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDate: string) => void;
  onToggleComplete: (id: string) => void;
}

function CalendarDay({
  date,
  dateStr,
  day,
  tasks,
  taskLoad,
  onDayClick,
  onTaskClick,
  onTaskDrop,
  onToggleComplete,
}: CalendarDayProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { taskId: string }) => {
      onTaskDrop(item.taskId, dateStr);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  const isToday =
    new Date().toISOString().split('T')[0] === dateStr;

  const heatmapColors = {
    none: '',
    low: 'bg-blue-500/10',
    medium: 'bg-yellow-500/20',
    high: 'bg-orange-500/30',
    urgent: 'bg-red-500/40',
  };

  return (
    <motion.div
      ref={drop}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`
        aspect-square border-2 rounded-xl p-2 cursor-pointer
        transition-all duration-200
        ${isToday ? 'ring-2 ring-primary border-primary shadow-lg' : 'border-border/50'}
        ${isOver ? 'bg-primary/20 scale-95' : heatmapColors[taskLoad]}
        hover:shadow-xl hover:border-primary/50
      `}
      onClick={() => onDayClick(date)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <motion.span
            className={`text-sm font-medium ${isToday ? 'font-bold text-primary gradient-text' : ''}`}
            animate={isToday ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {day}
          </motion.span>
          {tasks.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {tasks.filter(t => t.completed).length}/{tasks.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-hidden space-y-1">
          {tasks.slice(0, 3).map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TaskCard
                task={task}
                compact
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick(task);
                }}
                onToggleComplete={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task.id);
                }}
              />
            </motion.div>
          ))}
          {tasks.length > 3 && (
            <p className="text-xs text-muted-foreground font-medium">
              +{tasks.length - 3} more
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function CalendarMonthView({
  tasks,
  selectedDate,
  setSelectedDate,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
}: CalendarMonthViewProps) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDayForNewTask, setSelectedDayForNewTask] = useState<Date | null>(null);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDayForNewTask(date);
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setSelectedDayForNewTask(null);
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
    setSelectedDayForNewTask(null);
  };

  const handleTaskDrop = (taskId: string, newDate: string) => {
    onUpdateTask(taskId, { date: newDate });
  };

  // Calculate task load for heatmap
  const getTaskLoad = (date: string) => {
    const dayTasks = tasks.filter(t => t.date === date);
    const urgentCount = dayTasks.filter(t => t.priority === 'urgent').length;
    const highCount = dayTasks.filter(t => t.priority === 'high').length;

    if (urgentCount > 0) return 'urgent';
    if (highCount > 1) return 'high';
    if (dayTasks.length > 3) return 'medium';
    if (dayTasks.length > 0) return 'low';
    return 'none';
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth} className="hover-lift">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl min-w-[200px] text-center gradient-text">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <Button variant="outline" size="icon" onClick={nextMonth} className="hover-lift">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm text-muted-foreground p-2 font-medium">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const date = new Date(year, month, day);
              const dateStr = date.toISOString().split('T')[0];
              const dayTasks = tasks.filter(t => t.date === dateStr);
              const taskLoad = getTaskLoad(dateStr);

              return (
                <CalendarDay
                  key={dateStr}
                  date={date}
                  dateStr={dateStr}
                  day={day}
                  tasks={dayTasks}
                  taskLoad={taskLoad}
                  onDayClick={handleDayClick}
                  onTaskClick={handleTaskClick}
                  onTaskDrop={handleTaskDrop}
                  onToggleComplete={onToggleComplete}
                />
              );
            })}
          </div>
        </motion.div>

        <TaskModal
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
            setSelectedDayForNewTask(null);
          }}
          onSave={handleSaveTask}
          task={editingTask}
          initialDate={selectedDayForNewTask}
          allTasks={tasks}
        />
      </div>
    </DndProvider>
  );
}
