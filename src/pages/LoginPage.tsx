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
      if (!supabase) {
        throw new Error('Authentication service not configured');
      }
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
      if (!supabase) {
        throw new Error('Authentication service not configured');
      }
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md relative z-10 bg-white/60"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair text-charcoal mb-2">
            Elite
          </h1>
          <p className="text-charcoal/40 text-sm uppercase tracking-widest">
            Academic Manager
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal/60 uppercase mb-2 tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background/50 border border-charcoal/10 rounded-xl p-3 text-charcoal focus:outline-none focus:border-gold/40 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal/60 uppercase mb-2 tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background/50 border border-charcoal/10 rounded-xl p-3 text-charcoal focus:outline-none focus:border-gold/40 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-button py-3 text-sm font-bold tracking-wider uppercase"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleSignUp}
              className="text-xs text-gold hover:text-charcoal transition-colors uppercase tracking-wider"
            >
              Create New Account
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
