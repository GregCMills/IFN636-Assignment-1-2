import { useAuth } from '@clerk/clerk-react';
import axiosInstance from '../axiosConfig';
import { Task } from '../types';

/** Props passed down from the Tasks page to keep task state in a single parent. */
interface TaskListProps {
  /** Tasks to display. */
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  /** Callback to load a task into the edit form. */
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

/**
 * Renders the list of tasks belonging to the authenticated user.
 * Each item provides Edit (loads task into TaskForm) and Delete (calls API and
 * updates state optimistically) actions.
 * Displays an empty-state message when there are no tasks.
 */
const TaskList = ({ tasks, setTasks, setEditingTask }: TaskListProps) => {
  const { getToken, isSignedIn } = useAuth();

  const handleDelete = async (taskId: string) => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch {
      alert('Failed to delete task.');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="card p-8 text-center text-text-muted">
        No tasks yet. Create one above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-text-primary truncate">{task.title}</h2>
            <p className="text-sm text-text-secondary mt-0.5">{task.description}</p>
            <p className="text-xs text-text-subtle mt-1">
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setEditingTask(task)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors
                         text-status-warning border-status-warning-dim
                         hover:bg-status-warning-dim/40"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(task._id)}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors
                         text-status-danger border-status-danger-dim
                         hover:bg-status-danger-dim/40"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
