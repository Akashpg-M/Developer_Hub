import { useState, useEffect } from 'react';
import { Task, TaskStatusEnum, TaskPriorityEnum } from '../store/useTaskStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { X } from 'lucide-react';

const statusOptions = [
  { value: TaskStatusEnum.TODO, label: 'To Do' },
  { value: TaskStatusEnum.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatusEnum.IN_REVIEW, label: 'In Review' },
  { value: TaskStatusEnum.DONE, label: 'Done' },
  { value: TaskStatusEnum.BACKLOG, label: 'Backlog' },
];

const priorityOptions = [
  { value: TaskPriorityEnum.LOW, label: 'Low' },
  { value: TaskPriorityEnum.MEDIUM, label: 'Medium' },
  { value: TaskPriorityEnum.HIGH, label: 'High' },
  { value: TaskPriorityEnum.CRITICAL, label: 'Critical' },
];

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'communityId'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskForm({ initialData, onSubmit, onCancel, loading = false }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatusEnum.TODO,
    priority: TaskPriorityEnum.MEDIUM,
    dueDate: '',
    projectId: '',
    assignedToId: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || TaskStatusEnum.TODO,
        priority: initialData.priority || TaskPriorityEnum.MEDIUM,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        projectId: initialData.projectId || '',
        assignedToId: initialData.assignedToId || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: formData.dueDate || undefined,
      projectId: formData.projectId || undefined,
      assignedToId: formData.assignedToId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date (optional)</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
