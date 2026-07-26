import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, CheckSquare } from 'lucide-react';

export default function Navbar() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center text-white">
      <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
        <CheckSquare className="w-6 h-6" />
        <span>TaskSync Pro</span>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">
            Welcome, <strong className="text-white">{user.name}</strong>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}