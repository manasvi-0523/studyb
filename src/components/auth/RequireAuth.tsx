import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export function RequireAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = getSupabaseClient();

        if (!supabase) {
            setLoading(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const isConfigured = getSupabaseClient() !== null;

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white">
                <div className="animate-pulse tracking-widest text-xs uppercase text-gray-500 mb-4">
                    Verifying Clearance...
                </div>
            </div>
        );
    }

    // If not configured, allow access but maybe we could show a warning banner later
    if (!isConfigured) {
        return <Outlet />;
    }

    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
}
