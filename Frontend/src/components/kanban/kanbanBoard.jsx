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

  // Check matching status case-insensitively across formats
  const filterTasks = (statusName) => {
    return tasks.filter((t) => {
      if (!t.status) return false;
      const s1 = t.status.toString().toLowerCase().replace(/[\s_]+/g, '');
      const s2 = statusName.toLowerCase().replace(/[\s_]+/g, '');
      return s1 === s2;
    });
  };

  const columns = [
    { title: 'To Do', key: 'To Do', color: 'border-blue-500' },
    { title: 'In Progress', key: 'In Progress', color: 'border-yellow-500' },
    { title: 'Review', key: 'Review', color: 'border-purple-500' },
    { title: 'Completed', key: 'Completed', color: 'border-green-500' }
  ];

  if (loading) {
    return <div className="text-gray-400 py-10 text-center">Loading board tasks...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => {
        const columnTasks = filterTasks(col.key);
        return (
          <div key={col.key} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex flex-col h-[70vh]">
            <div className={`flex justify-between items-center pb-3 mb-4 border-b-2 ${col.color}`}>
              <h3 className="font-bold text-white text-base">{col.title}</h3>
              <span className="bg-slate-700 text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onTaskUpdate={fetchTasks} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs border-2 border-dashed border-slate-700/50 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}