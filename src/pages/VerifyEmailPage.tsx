import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, RefreshCw, Loader2, Check, ArrowLeft, LogOut } from "lucide-react";

export function VerifyEmailPage() {
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { user, sendVerification, signOut, isEmailVerified } = useAuth();
    const navigate = useNavigate();

    // If email is verified, redirect to dashboard
    if (isEmailVerified) {
        navigate("/dashboard");
        return null;
    }

    const handleResendVerification = async () => {
        setIsResending(true);
        setError(null);
        setResendSuccess(false);

        try {
            await sendVerification();
            setResendSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to resend verification email");
        } finally {
            setIsResending(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    const handleRefreshStatus = () => {
        // Reload the page to check if email is now verified
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-beige/20 to-sage/10 flex items-center justify-center p-4">
            {/* Decorative Elements */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-sage/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Card */}
                <div className="glass-card p-8 bg-white/80 backdrop-blur-xl text-center">
                    {/* Email Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/20 mb-6">
                        <Mail size={40} className="text-gold" />
                    </div>

                    <h1 className="font-playfair text-2xl text-charcoal mb-2">Verify Your Email</h1>
                    <p className="text-sm text-charcoal/60 mb-6 leading-relaxed">
                        We've sent a verification link to<br />
                        <span className="font-medium text-charcoal">{user?.email}</span>
                    </p>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    {resendSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center justify-center gap-2">
                            <Check size={16} />
                            Verification email sent!
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-charcoal/5 rounded-2xl p-4 mb-6 text-left">
                        <h3 className="text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-3">Next Steps</h3>
                        <ol className="space-y-2 text-sm text-charcoal/70">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                Check your inbox for the verification email
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                Click the verification link in the email
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                Click "I've Verified" below to continue
                            </li>
                        </ol>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRefreshStatus}
                            className="gold-button w-full py-3 flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            I've Verified My Email
                        </button>

                        <button
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="w-full py-3 rounded-full text-sm font-medium text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 transition-all flex items-center justify-center gap-2"
                        >
                            {isResending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <RefreshCw size={16} />
                            )}
                            Resend Verification Email
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-charcoal/10 flex justify-between">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-xs text-charcoal/40 hover:text-charcoal flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Back to Sign In
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="text-xs text-charcoal/40 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-center text-xs text-charcoal/40 mt-6">
                    Didn't receive the email? Check your spam folder or try resending.
                </p>
            </div>
        </div>
    );
}
