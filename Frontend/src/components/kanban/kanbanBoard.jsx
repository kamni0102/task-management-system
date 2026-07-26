import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Calendar } from 'lucide-react';

export default function KanbanBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await API.get(`/tasks/project/${projectId}`);
      } catch (e) {
        // Fallback if route expects different params
        res = await API.get('/tasks');
      }
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to color-code priorities
  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (p === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  // Ultra-flexible status filter so no tasks get hidden
  const filterTasks = (columnTitle) => {
    return tasks.filter((t) => {
      if (!t || !t.status) return columnTitle === 'To Do';
      const s = t.status.toString().toLowerCase().replace(/[\s_]+/g, '');
      const col = columnTitle.toLowerCase().replace(/[\s_]+/g, '');

      if (col === 'todo' && (s === 'todo' || s === 'to do')) return true;
      if (col === 'inprogress' && (s === 'inprogress' || s === 'in progress')) return true;
      if (col === 'review' && s === 'review') return true;
      if (col === 'completed' && (s === 'completed' || s === 'done')) return true;

      return s === col;
    });
  };

  const columns = [
    { title: 'To Do', color: 'border-blue-500' },
    { title: 'In Progress', color: 'border-yellow-500' },
    { title: 'Review', color: 'border-purple-500' },
    { title: 'Completed', color: 'border-green-500' }
  ];

  if (loading) {
    return <div className="text-gray-400 py-10 text-center">Loading board tasks...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => {
        const columnTasks = filterTasks(col.title);
        return (
          <div key={col.title} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex flex-col h-[70vh]">
            {/* Column Header */}
            <div className={`flex justify-between items-center pb-3 mb-4 border-b-2 ${col.color}`}>
              <h3 className="font-bold text-white text-base">{col.title}</h3>
              <span className="bg-slate-700 text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnTasks.length > 0 ? (
                columnTasks.map((task, idx) => (
                  <div 
                    key={task._id || idx} 
                    className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md hover:border-slate-600 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-white text-sm">{task.title || 'Untitled Task'}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getPriorityBadge(task.priority)}`}>
                        {task.priority || 'Low'}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-400 text-xs line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-slate-700/50">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                      </div>
                    </div>
                  </div>
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