import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export function RequireAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = getSupabaseClient();

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

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-white">
                <div className="animate-pulse tracking-widest text-xs uppercase text-gray-500">
                    Verifying Clearance...
                </div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
}
