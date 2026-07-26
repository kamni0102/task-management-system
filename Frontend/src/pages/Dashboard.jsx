import React, { useState, useEffect } from 'react';
import API from '../services/api';
import KanbanBoard from '../components/kanban/kanbanBoard';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Load user projects or create a default one
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get('/projects');
      
      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        setCurrentProject(res.data[0]);
      } else {
        // Automatically create a default project if none exist
        const defaultProject = await API.post('/projects', {
          name: 'Main Workspace',
          description: 'Default project workspace'
        });
        setProjects([defaultProject.data]);
        setCurrentProject(defaultProject.data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Project Dashboard</h1>
            <p className="text-gray-400 text-sm">
              {currentProject ? `Workspace: ${currentProject.name}` : 'Live collaboration and task workflow'}
            </p>
          </div>

          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition"
          >
            <Plus className="h-5 w-5" />
            <span>New Task</span>
          </button>
        </div>

        {/* Board Display */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading workspace...</div>
        ) : currentProject ? (
          <KanbanBoard projectId={currentProject._id} />
        ) : (
          <div className="text-center py-20 text-gray-400">
            No active project found. Click "New Task" or refresh to create one.
          </div>
        )}

      </div>
    </div>
  );
}