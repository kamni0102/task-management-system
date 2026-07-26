import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import TaskCard from './TaskCard';

export default function KanbanBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/tasks/project/${projectId}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Normalize status strings for matching
  const filterTasksByStatus = (statusKey) => {
    return tasks.filter((task) => {
      if (!task.status) return false;
      const normalized = task.status.toString().toLowerCase().replace(/[\s_]+/g, '');
      const target = statusKey.toLowerCase().replace(/[\s_]+/g, '');
      return normalized === target;
    });
  };

  const columns = [
    { title: 'To Do', key: 'todo', color: 'border-blue-500' },
    { title: 'In Progress', key: 'in_progress', color: 'border-yellow-500' },
    { title: 'Completed', key: 'completed', color: 'border-green-500' }
  ];

  if (loading) {
    return <div className="text-gray-400 py-10 text-center">Loading board tasks...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const columnTasks = filterTasksByStatus(col.key);
        return (
          <div key={col.key} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex flex-col h-[70vh]">
            {/* Column Header */}
            <div className={`flex justify-between items-center pb-3 mb-4 border-b-2 ${col.color}`}>
              <h3 className="font-bold text-white text-lg">{col.title}</h3>
              <span className="bg-slate-700 text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                {columnTasks.length}
              </span>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onTaskUpdate={fetchTasks} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-lg">
                  No tasks in {col.title}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}