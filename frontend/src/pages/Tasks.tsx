import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { Task } from '../types';

const Tasks = () => {
  const { getToken, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = await getToken();
        const response = await axiosInstance.get('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.warn('Task routes not yet implemented.');
      }
    };

    if (isSignedIn) fetchTasks();
  }, [isSignedIn]);

  return (
    <div className="container mx-auto p-6">
      <TaskForm
        tasks={tasks}
        setTasks={setTasks}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />
      <TaskList tasks={tasks} setTasks={setTasks} setEditingTask={setEditingTask} />
    </div>
  );
};

export default Tasks;
