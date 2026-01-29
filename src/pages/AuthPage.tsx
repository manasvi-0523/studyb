import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Loader2, Eye, EyeOff, Sparkles, ArrowRight, Check } from "lucide-react";

type AuthMode = "signin" | "signup";

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { signIn, signUp, isFirebaseEnabled } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!isFirebaseEnabled) {
            // Mock login for development
            navigate("/dashboard");
            return;
        }

        if (mode === "signup" && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            if (mode === "signup") {
                await signUp(email, password);
                setSuccess("Account created! Please check your email to verify your account.");
                // Redirect to verify email page
                setTimeout(() => navigate("/verify-email"), 2000);
            } else {
                await signIn(email, password);
                navigate("/dashboard");
            }
        } catch (err: any) {
            const errorMessage = err.code === "auth/email-already-in-use"
                ? "Email is already registered"
                : err.code === "auth/invalid-credential"
                    ? "Invalid email or password"
                    : err.code === "auth/weak-password"
                        ? "Password is too weak"
                        : err.message || "Authentication failed";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-beige/20 to-sage/10 flex items-center justify-center p-4">
            {/* Decorative Elements */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-sage/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/20 mb-4">
                        <Sparkles size={32} className="text-gold" />
                    </div>
                    <h1 className="font-playfair text-3xl text-charcoal">Elite</h1>
                    <p className="text-xs text-charcoal/40 uppercase tracking-widest mt-1">Academic Manager</p>
                </div>

                {/* Auth Card */}
                <div className="glass-card p-8 bg-white/80 backdrop-blur-xl">
                    {/* Mode Tabs */}
                    <div className="flex mb-8 p-1 bg-charcoal/5 rounded-xl">
                        <button
                            onClick={() => { setMode("signin"); setError(null); setSuccess(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signin"
                                    ? "bg-white text-charcoal shadow-sm"
                                    : "text-charcoal/60 hover:text-charcoal"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signup"
                                    ? "bg-white text-charcoal shadow-sm"
                                    : "text-charcoal/60 hover:text-charcoal"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center gap-2">
                            <Check size={16} />
                            {success}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Email</label>
                            <div className="relative mt-2">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full h-12 bg-background/50 border border-charcoal/10 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-gold/40 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Password</label>
                            <div className="relative mt-2">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-12 bg-background/50 border border-charcoal/10 rounded-xl pl-12 pr-12 text-sm focus:outline-none focus:border-gold/40 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {mode === "signup" && (
                            <div>
                                <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider">Confirm Password</label>
                                <div className="relative mt-2">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-12 bg-background/50 border border-charcoal/10 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:border-gold/40 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="gold-button w-full py-3 mt-6 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {mode === "signin" ? "Sign In" : "Create Account"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Firebase not configured notice */}
                    {!isFirebaseEnabled && (
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
                            <strong>Firebase Not Configured</strong>
                            <p className="mt-1">Authentication is disabled. To enable login:</p>
                            <ol className="mt-2 ml-4 list-decimal space-y-1">
                                <li>Create a Firebase project at <span className="font-mono">console.firebase.google.com</span></li>
                                <li>Enable Email/Password authentication</li>
                                <li>Add environment variables in Vercel dashboard</li>
                            </ol>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-charcoal/40 mt-6">
                    By continuing, you agree to Elite's Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
