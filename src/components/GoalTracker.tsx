import { useState } from 'react';
import { Goal, Task, Category } from '../App';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Plus, Target, TrendingUp, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';

interface GoalTrackerProps {
  goals: Goal[];
  tasks: Task[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalTracker({
  goals,
  tasks,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalTrackerProps) {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState<Category>('personal');

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthGoals = goals.filter(g => g.month === currentMonth);

  const handleAddGoal = () => {
    if (!title.trim() || !target || parseInt(target) <= 0) {
      toast.error('Please enter a valid goal title and target');
      return;
    }

    onAddGoal({
      title,
      target: parseInt(target),
      current: 0,
      month: currentMonth,
      category,
    });

    setTitle('');
    setTarget('');
    setCategory('personal');
    setGoalModalOpen(false);
    toast.success('Goal added!');
  };

  const incrementGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (goal && goal.current < goal.target) {
      onUpdateGoal(id, { current: goal.current + 1 });
    }
  };

  const decrementGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (goal && goal.current > 0) {
      onUpdateGoal(id, { current: goal.current - 1 });
    }
  };

  // Calculate monthly statistics
  const monthTasks = tasks.filter(t => t.date.startsWith(currentMonth));
  const completedMonthTasks = monthTasks.filter(t => t.completed).length;
  const totalMonthTasks = monthTasks.length;

  const categoryColors = {
    work: 'from-purple-500 to-purple-700',
    personal: 'from-green-500 to-green-700',
    health: 'from-pink-500 to-pink-700',
    social: 'from-blue-500 to-blue-700',
    learning: 'from-indigo-500 to-indigo-700',
    other: 'from-gray-500 to-gray-700',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Goal Tracker</h2>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => setGoalModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks This Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalMonthTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedMonthTasks} completed
            </p>
            <Progress
              value={totalMonthTasks > 0 ? (completedMonthTasks / totalMonthTasks) * 100 : 0}
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{currentMonthGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthGoals.filter(g => g.current >= g.target).length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {totalMonthTasks > 0
                ? Math.round((completedMonthTasks / totalMonthTasks) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {currentMonthGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMonthGoals.map(goal => {
            const percentage = (goal.current / goal.target) * 100;
            const isCompleted = goal.current >= goal.target;

            return (
              <Card
                key={goal.id}
                className={`relative overflow-hidden ${
                  isCompleted ? 'border-green-500' : ''
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    categoryColors[goal.category]
                  } opacity-5`}
                />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {goal.category}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        onDeleteGoal(goal.id);
                        toast.success('Goal deleted');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {Math.round(percentage)}%
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decrementGoal(goal.id)}
                      disabled={goal.current === 0}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementGoal(goal.id)}
                      disabled={goal.current >= goal.target}
                      className="flex-1"
                    >
                      Update Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => incrementGoal(goal.id)}
                      disabled={goal.current >= goal.target}
                    >
                      +
                    </Button>
                  </div>

                  {isCompleted && (
                    <div className="text-center text-sm text-green-500 font-medium">
                      🎉 Goal Completed!
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No goals set for this month.</p>
          <Button variant="link" onClick={() => setGoalModalOpen(true)} className="mt-2">
            Create your first goal
          </Button>
        </div>
      )}

      {/* Add Goal Modal */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Read 3 books, Exercise 15 times"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-target">Target Number</Label>
              <Input
                id="goal-target"
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., 3, 15, 30"
              />
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
