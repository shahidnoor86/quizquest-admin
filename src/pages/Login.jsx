import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, Zap, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const FIREBASE_ERRORS = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Try again.",
  "auth/invalid-credential": "Invalid credentials. Check email and password.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/invalid-email": "The email address is badly formatted.",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      const msg = FIREBASE_ERRORS[err.code] ?? "Something went wrong. Try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center relative overflow-hidden px-4">
      {/* Gradient mesh background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 shadow-2xl shadow-black/60 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
                QuizForge
              </h1>
              <p className="text-[#A1A1AA] text-xs">Admin Console</p>
            </div>
          </div>

          <h2 className="text-white text-2xl font-semibold mb-1">Sign in</h2>
          <p className="text-[#A1A1AA] text-sm mb-7">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1.5 font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`w-full bg-[#0F0F0F] border ${
                    errors.email ? "border-red-500/70" : "border-[#2A2A2A]"
                  } rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-[#52525B] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-red-400 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full bg-[#0F0F0F] border ${
                    errors.password ? "border-red-500/70" : "border-[#2A2A2A]"
                  } rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-[#52525B] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-red-400 text-xs">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#52525B] text-xs mt-6">
          QuizForge Admin © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}