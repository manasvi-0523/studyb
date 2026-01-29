import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireEmailVerification?: boolean;
}

export function ProtectedRoute({ children, requireEmailVerification = false }: ProtectedRouteProps) {
    const { isAuthenticated, isEmailVerified, isLoading, isFirebaseEnabled } = useAuth();
    const location = useLocation();

    // If Firebase is not enabled, allow access (for development)
    if (!isFirebaseEnabled) {
        return <>{children}</>;
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-gold mx-auto mb-4" />
                    <p className="text-charcoal/60 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to verify-email page if email verification is required but not verified
    if (requireEmailVerification && !isEmailVerified) {
        return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

// Component to redirect authenticated users away from auth pages
export function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, isFirebaseEnabled } = useAuth();
    const location = useLocation();

    // If Firebase is not enabled, render children
    if (!isFirebaseEnabled) {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-gold mx-auto mb-4" />
                    <p className="text-charcoal/60 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
}
