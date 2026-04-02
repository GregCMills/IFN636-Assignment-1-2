import { useAuth } from '@clerk/clerk-react';
import axiosInstance from '../axiosConfig';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

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
    } catch (error) {
      alert('Failed to delete task.');
    }
  };

  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{task.title}</h2>
          <p>{task.description}</p>
          <p className="text-sm text-gray-500">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingTask(task)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(task._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
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
