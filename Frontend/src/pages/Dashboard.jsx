import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { SocketContext } from '../context/SocketContext';
import KanbanBoard from '../components/kanban/kanbanBoard';
import { Plus, Kanban, X, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for New Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  // Selected Task Modal (For detail/edit)
  const [selectedTask, setSelectedTask] = useState(null);

  const socket = useContext(SocketContext);

  // 1. Fetch or auto-create project
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/projects');
      if (data.length > 0) {
        setProjects(data);
        setActiveProject(data[0]);
      } else {
        const newProj = await API.post('/projects', {
          name: 'My Workspace',
          description: 'Default project board',
        });
        setProjects([newProj.data]);
        setActiveProject(newProj.data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Load Tasks and Listen to WebSockets
  useEffect(() => {
    if (!activeProject) return;

    API.get(`/tasks/project/${activeProject._id}`)
      .then(({ data }) => setTasks(data))
      .catch((err) => console.error('Error loading tasks:', err));

    if (socket) {
      socket.emit('joinProject', activeProject._id);

      socket.on('taskCreated', (newTask) => {
        setTasks((prev) => {
          if (prev.some((t) => t._id === newTask._id)) return prev;
          return [...prev, newTask];
        });
      });

      socket.on('taskUpdated', (updatedTask) =>
        setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)))
      );

      socket.on('taskDeleted', (id) => setTasks((prev) => prev.filter((t) => t._id !== id)));

      return () => {
        socket.emit('leaveProject', activeProject._id);
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
      };
    }
  }, [activeProject, socket]);

  // Handle Drag & Drop status updates
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await API.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Quick Complete Button handler
  const handleQuickComplete = async (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: 'Completed' } : t))
    );
    try {
      await API.put(`/tasks/${taskId}`, { status: 'Completed' });
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    if (selectedTask?._id === taskId) setSelectedTask(null);

    try {
      await API.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !activeProject) return;

    try {
      setCreating(true);
      const { data } = await API.post('/tasks', {
        title,
        description,
        priority,
        status,
        dueDate: dueDate || null,
        project: activeProject._id,
      });

      setTasks((prev) => {
        if (prev.some((t) => t._id === data._id)) return prev;
        return [...prev, data];
      });

      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('To Do');
      setDueDate('');
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-3">
          <Kanban className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">{activeProject ? activeProject.name : 'Project Dashboard'}</h1>
            <p className="text-xs text-slate-400">Live collaboration and task workflow</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </header>

      <main className="p-4 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" /> Loading workspace...
          </div>
        ) : activeProject ? (
          <KanbanBoard
            tasks={tasks}
            onDragEnd={handleDragEnd}
            onTaskClick={(task) => setSelectedTask(task)}
            onDeleteTask={handleDeleteTask}
            onQuickComplete={handleQuickComplete}
          />
        ) : (
          <div className="text-center py-20 text-slate-500">No active project found.</div>
        )}
      </main>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-lg text-white">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Landing Page"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Add details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Column / Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
