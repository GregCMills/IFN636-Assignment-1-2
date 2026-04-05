import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axiosInstance from '../axiosConfig';
import { Task } from '../types';

interface TaskFormProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  editingTask: Task | null;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask }: TaskFormProps) => {
  const { getToken, isSignedIn } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '' });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        deadline: editingTask.deadline,
      });
    } else {
      setFormData({ title: '', description: '', deadline: '' });
    }
  }, [editingTask]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (editingTask) {
        const response = await axiosInstance.put(`/api/tasks/${editingTask._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(tasks.map((task) => (task._id === response.data._id ? response.data : task)));
      } else {
        const response = await axiosInstance.post('/api/tasks', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks([...tasks, response.data]);
      }
      setEditingTask(null);
      setFormData({ title: '', description: '', deadline: '' });
    } catch {
      alert('Failed to save task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 mb-6">
      <h1 className="text-xl font-bold mb-5 text-text-primary">
        {editingTask ? 'Your Form Name: Edit Operation' : 'Your Form Name: Create Operation'}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-label mb-1">Title</label>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-label mb-1">Description</label>
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-label mb-1">Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="input-base"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" className="btn-primary flex-1">
            {editingTask ? 'Update Button' : 'Create Button'}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
