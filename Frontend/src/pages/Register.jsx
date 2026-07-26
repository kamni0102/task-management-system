import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 p-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-xl w-full max-w-md space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl">
          <UserPlus className="w-6 h-6" /> Create Account
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            required
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm">
          Register
        </button>
        <p className="text-xs text-slate-400 text-center">
          Already have an account? <Link to="/login" className="text-indigo-400 underline">Login</Link>
        </p>
      </form>
    </div>
  );
}