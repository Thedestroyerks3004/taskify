import { useState, useEffect } from 'react';
import { Task, Priority, Category } from '../App';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Wand2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  task?: Task | null;
  initialDate?: Date | null;
  allTasks: Task[];
}

export function TaskModal({
  open,
  onClose,
  onSave,
  task,
  initialDate,
  allTasks,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('personal');
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | undefined>();
  const [reminder, setReminder] = useState(false);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [naturalInput, setNaturalInput] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDate(task.date);
      setTime(task.time || '');
      setPriority(task.priority);
      setCategory(task.category);
      setRecurring(task.recurring);
      setReminder(task.reminder || false);
      setDependencies(task.dependencies || []);
    } else if (initialDate) {
      setDate(initialDate.toISOString().split('T')[0]);
      setTitle('');
      setDescription('');
      setTime('');
      setPriority('medium');
      setCategory('personal');
      setRecurring(undefined);
      setReminder(false);
      setDependencies([]);
    }
  }, [task, initialDate, open]);

  const parseNaturalLanguage = (input: string) => {
    const lower = input.toLowerCase();

    // Extract title (everything before common keywords)
    let extractedTitle = input;
    const keywords = ['on', 'at', 'tomorrow', 'today', 'next', 'priority', 'urgent', 'important'];
    for (const keyword of keywords) {
      const idx = lower.indexOf(keyword);
      if (idx > 0) {
        extractedTitle = input.substring(0, idx).trim();
        break;
      }
    }
    setTitle(extractedTitle);

    // Priority detection
    if (lower.includes('urgent') || lower.includes('asap')) {
      setPriority('urgent');
    } else if (lower.includes('high priority') || lower.includes('important')) {
      setPriority('high');
    } else if (lower.includes('low priority')) {
      setPriority('low');
    }

    // Category detection
    if (lower.includes('work') || lower.includes('meeting') || lower.includes('project')) {
      setCategory('work');
    } else if (lower.includes('workout') || lower.includes('exercise') || lower.includes('health')) {
      setCategory('health');
    } else if (lower.includes('learn') || lower.includes('study') || lower.includes('course')) {
      setCategory('learning');
    }

    // Date detection
    const today = new Date();
    if (lower.includes('today')) {
      setDate(today.toISOString().split('T')[0]);
    } else if (lower.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
    } else if (lower.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDate(nextWeek.toISOString().split('T')[0]);
    }

    // Time detection (simple patterns like "at 3pm", "at 15:00")
    const timeMatch = input.match(/at (\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] || '00';
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      setTime(`${hours.toString().padStart(2, '0')}:${minutes}`);
    }

    // Recurring detection
    if (lower.includes('daily') || lower.includes('every day')) {
      setRecurring('daily');
    } else if (lower.includes('weekly') || lower.includes('every week')) {
      setRecurring('weekly');
    } else if (lower.includes('monthly') || lower.includes('every month')) {
      setRecurring('monthly');
    }

    setNaturalInput('');
    toast.success('Parsed input successfully!');
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    onSave({
      title,
      description,
      date,
      time: time || undefined,
      priority,
      category,
      completed: task?.completed || false,
      recurring,
      reminder,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
    });

    toast.success(task ? 'Task updated!' : 'Task created!');
    onClose();
  };

  const availableTasks = allTasks.filter(t => t.id !== task?.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Natural Language Input */}
          <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Label className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Quick Add (Natural Language)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder='Try: "Meeting with team tomorrow at 3pm high priority"'
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    parseNaturalLanguage(naturalInput);
                  }
                }}
              />
              <Button
                variant="secondary"
                onClick={() => parseNaturalLanguage(naturalInput)}
              >
                Parse
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the task"
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurring */}
          <div className="space-y-2">
            <Label>Recurring</Label>
            <Select
              value={recurring || 'none'}
              onValueChange={(v) => setRecurring(v === 'none' ? undefined : v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reminder */}
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder">Enable Reminder</Label>
            <Switch
              id="reminder"
              checked={reminder}
              onCheckedChange={setReminder}
            />
          </div>

          {/* Dependencies */}
          {availableTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Dependencies (tasks that must be completed first)</Label>
              <Select
                onValueChange={(taskId) => {
                  if (!dependencies.includes(taskId)) {
                    setDependencies([...dependencies, taskId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add dependency..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTasks.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {dependencies.map(depId => {
                    const depTask = allTasks.find(t => t.id === depId);
                    return depTask ? (
                      <Badge key={depId} variant="secondary">
                        {depTask.title}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() =>
                            setDependencies(dependencies.filter(id => id !== depId))
                          }
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {task ? 'Update' : 'Create'} Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
