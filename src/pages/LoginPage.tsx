import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to login';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      alert('Check your email for the confirmation link!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a1a_0%,_#000000_100%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2E5BFF] to-transparent opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 w-full max-w-md relative z-10 border border-white/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
            SARWAK
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">
            Academic Command Center
          </p>
        </div>

        {error && (
          <div className="bg-[#FF3131]/10 border border-[#FF3131]/30 text-[#FF3131] p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Cadet Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded p-3 text-white focus:outline-none focus:border-[#2E5BFF] transition-colors"
              placeholder="cadet@sarwak.edu"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded p-3 text-white focus:outline-none focus:border-[#2E5BFF] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full neon-button py-3 text-sm font-bold tracking-wider uppercase"
          >
            {loading ? 'Authenticating...' : 'Enter Command Center'}
          </button>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleSignUp}
              className="text-xs text-[#2E5BFF] hover:text-white transition-colors uppercase tracking-wider"
            >
              Initialize New Cadet Profile
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
