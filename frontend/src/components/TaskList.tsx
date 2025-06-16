import { Task, TaskStatusEnum, TaskPriorityEnum } from '../store/useTaskStore';
import { format, isToday, isPast, isTomorrow } from 'date-fns';
import { Check, Clock, AlertCircle, CheckCircle, Loader2, MoreVertical } from 'lucide-react';

const priorityColors = {
  [TaskPriorityEnum.LOW]: 'bg-blue-100 text-blue-800',
  [TaskPriorityEnum.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriorityEnum.HIGH]: 'bg-orange-100 text-orange-800',
  [TaskPriorityEnum.CRITICAL]: 'bg-red-100 text-red-800',
};

const statusIcons = {
  [TaskStatusEnum.BACKLOG]: <Clock className="w-4 h-4 text-gray-500" />,
  [TaskStatusEnum.TODO]: <AlertCircle className="w-4 h-4 text-blue-500" />,
  [TaskStatusEnum.IN_PROGRESS]: <div className="w-3 h-3 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />,
  [TaskStatusEnum.IN_REVIEW]: <div className="w-3 h-3 rounded-full border-2 border-purple-500" />,
  [TaskStatusEnum.DONE]: <CheckCircle className="w-4 h-4 text-green-500" />,
};

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatusEnum) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  loading?: boolean;
}

export function TaskList({ tasks, onStatusChange, onEdit, onDelete, loading = false }: TaskListProps) {
  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue: ${format(date, 'MMM d')}`;
    return format(date, 'MMM d');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No tasks found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const dueDate = formatDueDate(task.dueDate);
        const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== TaskStatusEnum.DONE;
        
        return (
          <div
            key={task.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150 flex items-start gap-3"
          >
            <button
              onClick={() => onStatusChange(
                task.id,
                task.status === TaskStatusEnum.DONE ? TaskStatusEnum.TODO : TaskStatusEnum.DONE
              )}
              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center ${
                task.status === TaskStatusEnum.DONE
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-blue-500'
              }`}
            >
              {task.status === TaskStatusEnum.DONE && <Check className="w-3 h-3" />}
            </button>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 truncate">{task.title}</span>
                {task.priority && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority] || 'bg-gray-100'}`}
                  >
                    {task.priority.toLowerCase()}
                  </span>
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {statusIcons[task.status]}
                  <span className="capitalize">{task.status.toLowerCase().replace('_', ' ')}</span>
                </div>
                
                {dueDate && (
                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                    <Clock className="w-3 h-3" />
                    {dueDate}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 flex gap-1">
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-blue-500"
                aria-label="Edit task"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
