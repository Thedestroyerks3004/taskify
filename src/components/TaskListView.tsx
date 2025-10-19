import { useState } from 'react';
import { Task } from '../App';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Calendar, Search, Trash2, Edit, ChevronDown } from 'lucide-react';
import { TaskModal } from './TaskModal';
import { motion } from 'motion/react';

interface TaskListViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function TaskListView({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
}: TaskListViewProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Filter tasks
  let filteredTasks = [...tasks];

  if (startDate) {
    filteredTasks = filteredTasks.filter(t => t.date >= startDate);
  }
  if (endDate) {
    filteredTasks = filteredTasks.filter(t => t.date <= endDate);
  }
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }

  // Sort by date (and time within date)
  filteredTasks.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  // Group tasks by date for combined display
  const tasksByDate = filteredTasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});
  const groupedDates = Object.keys(tasksByDate).sort((a, b) => a.localeCompare(b));

  const toggleDateExpanded = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-700 border-blue-300 dark:bg-blue-500/30 dark:text-blue-300',
    medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-300 dark:bg-yellow-500/30 dark:text-yellow-300',
    high: 'bg-orange-500/20 text-orange-700 border-orange-300 dark:bg-orange-500/30 dark:text-orange-300',
    urgent: 'bg-red-500/20 text-red-700 border-red-300 dark:bg-red-500/30 dark:text-red-300',
  };

  const categoryColors = {
    work: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    personal: 'bg-green-500/20 text-green-700 dark:text-green-300',
    health: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
    social: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    learning: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    other: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, task);
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Filter Tasks</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {(startDate || endDate || searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </motion.div>

      {/* Task Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-primary/5 to-accent/5">
                <TableHead className="w-12 border-r border-border/50">Done</TableHead>
                <TableHead className="border-r border-border/50">Date</TableHead>
                <TableHead className="border-r border-border/50">Time</TableHead>
                <TableHead className="border-r border-border/50">Task</TableHead>
                <TableHead className="border-r border-border/50">Description</TableHead>
                <TableHead className="border-r border-border/50">Priority</TableHead>
                <TableHead className="border-r border-border/50">Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No tasks found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                groupedDates.map((date, groupIndex) => {
                  const dayTasks = tasksByDate[date];
                  const isSingle = dayTasks.length === 1;
                  if (isSingle) {
                    const task = dayTasks[0];
                    return (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.05 }}
                        className={`
                          group hover:bg-accent/30 transition-all duration-200
                          ${task.completed ? 'opacity-60' : ''}
                        `}
                      >
                         <TableCell className="border-r border-border/50">
                           <Checkbox
                             checked={task.completed}
                             onCheckedChange={() => onToggleComplete(task.id)}
                             className="checkbox-bounce"
                           />
                         </TableCell>
                         <TableCell className="font-medium border-r border-border/50">
                           {new Date(task.date).toLocaleDateString('en-US', {
                             month: 'short',
                             day: 'numeric',
                             year: 'numeric',
                           })}
                         </TableCell>
                         <TableCell className="text-muted-foreground border-r border-border/50">
                           {task.time || '—'}
                         </TableCell>
                         <TableCell className={`${task.completed ? 'line-through' : ''} border-r border-border/50`}>
                           <span className="font-medium">{task.title}</span>
                         </TableCell>
                         <TableCell className="text-muted-foreground max-w-xs truncate border-r border-border/50">
                           {task.description || '—'}
                         </TableCell>
                         <TableCell className="border-r border-border/50">
                           <Badge variant="outline" className={priorityColors[task.priority]}>
                             {task.priority}
                           </Badge>
                         </TableCell>
                         <TableCell className="border-r border-border/50">
                           <Badge variant="secondary" className={categoryColors[task.category]}>
                             {task.category}
                           </Badge>
                         </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(task)}
                              className="h-8 w-8 hover-lift"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteTask(task.id)}
                              className="h-8 w-8 hover-lift text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  }

                  const anyCompleted = dayTasks.every(t => t.completed);
                  const isExpanded = !!expandedDates[date];

                  return (
                    <>
                      <motion.tr
                        key={`group-header-${date}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.05 }}
                        className={`bg-accent/20`}
                      >
                        <TableCell colSpan={8} className="font-medium">
                          <button
                            className="flex items-center gap-2 w-full text-left"
                            onClick={() => toggleDateExpanded(date)}
                            aria-expanded={isExpanded}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                            />
                            <span>
                              {new Date(date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              <span className="ml-2 text-muted-foreground">({dayTasks.length} tasks)</span>
                              {anyCompleted && (
                                <span className="ml-2 text-muted-foreground">• all completed</span>
                              )}
                            </span>
                          </button>
                        </TableCell>
                      </motion.tr>
                      {isExpanded && dayTasks.map((task, subIndex) => (
                        <motion.tr
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: groupIndex * 0.05 + subIndex * 0.03 }}
                          className={`
                            group hover:bg-accent/30 transition-all duration-200
                            ${task.completed ? 'opacity-60' : ''}
                          `}
                        >
                           <TableCell className="border-r border-border/50">
                             <Checkbox
                               checked={task.completed}
                               onCheckedChange={() => onToggleComplete(task.id)}
                               className="checkbox-bounce"
                             />
                           </TableCell>
                           <TableCell className="font-medium text-muted-foreground border-r border-border/50">{/* date under header */}—</TableCell>
                           <TableCell className="text-muted-foreground border-r border-border/50">
                             {task.time || '—'}
                           </TableCell>
                           <TableCell className={`${task.completed ? 'line-through' : ''} border-r border-border/50`}>
                             <span className="font-medium">{task.title}</span>
                           </TableCell>
                           <TableCell className="text-muted-foreground max-w-xs truncate border-r border-border/50">
                             {task.description || '—'}
                           </TableCell>
                           <TableCell className="border-r border-border/50">
                             <Badge variant="outline" className={priorityColors[task.priority]}>
                               {task.priority}
                             </Badge>
                           </TableCell>
                           <TableCell className="border-r border-border/50">
                             <Badge variant="secondary" className={categoryColors[task.category]}>
                               {task.category}
                             </Badge>
                           </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(task)}
                                className="h-8 w-8 hover-lift"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteTask(task.id)}
                                className="h-8 w-8 hover-lift text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredTasks.length > 0 && (
          <div className="border-t bg-muted/30 px-6 py-4 text-sm text-muted-foreground">
            Showing {groupedDates.length} day{groupedDates.length !== 1 ? 's' : ''} •{' '}
            {filteredTasks.filter(t => t.completed).length} completed •{' '}
            {filteredTasks.filter(t => !t.completed).length} pending
          </div>
        )}
      </motion.div>

      <TaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        initialDate={null}
        allTasks={tasks}
      />
    </div>
  );
}
