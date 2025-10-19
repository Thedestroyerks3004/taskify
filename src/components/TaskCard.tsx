import { useDrag } from 'react-dnd';
import { Task } from '../App';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Clock, Repeat, Bell, Link2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onToggleComplete?: (e: React.MouseEvent) => void;
  showDate?: boolean;
}

export function TaskCard({
  task,
  compact = false,
  onClick,
  onToggleComplete,
  showDate = false,
}: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { taskId: task.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const categoryColors = {
    work: 'bg-purple-500/10 text-purple-500',
    personal: 'bg-green-500/10 text-green-500',
    health: 'bg-pink-500/10 text-pink-500',
    social: 'bg-blue-500/10 text-blue-500',
    learning: 'bg-indigo-500/10 text-indigo-500',
    other: 'bg-gray-500/10 text-gray-500',
  };

  if (compact) {
    return (
      <div
        ref={drag}
        className={`
          text-xs p-1.5 rounded-lg border cursor-pointer
          transition-all duration-200 hover:scale-105
          ${priorityColors[task.priority]}
          ${task.completed ? 'opacity-50 line-through' : ''}
          ${isDragging ? 'opacity-50 rotate-2' : ''}
        `}
        onClick={onClick}
      >
        <div className="flex items-center gap-1">
          <Checkbox
            checked={task.completed}
            onCheckedChange={onToggleComplete}
            onClick={(e) => e.stopPropagation()}
            className="w-3 h-3 checkbox-bounce"
          />
          <span className="truncate flex-1 font-medium">{task.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={drag}
      className={`
        p-4 glass-card cursor-move hover-lift
        transition-all duration-200
        ${task.completed ? 'opacity-60' : ''}
        ${isDragging ? 'opacity-50 scale-95 rotate-1' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggleComplete}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium ${
                task.completed ? 'line-through' : ''
              }`}
            >
              {task.title}
            </h4>
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={categoryColors[task.category]}>
              {task.category}
            </Badge>

            {task.time && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {task.time}
              </div>
            )}

            {task.recurring && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Repeat className="w-3 h-3" />
                {task.recurring}
              </div>
            )}

            {task.reminder && (
              <Bell className="w-3 h-3 text-muted-foreground" />
            )}

            {task.dependencies && task.dependencies.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Link2 className="w-3 h-3" />
                {task.dependencies.length}
              </div>
            )}

            {showDate && (
              <div className="text-xs text-muted-foreground">
                {new Date(task.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
