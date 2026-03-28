"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/today");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0f172a] border border-gray-800 shadow-lg space-y-6">

        {/* Header */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-widest">
            Welcome back
          </p>
          <h1 className="text-3xl font-bold mt-1">Login</h1>
          <p className="text-gray-400 text-sm mt-2">
            Enter your credentials to continue
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-[#020617] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-[#020617] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-400 text-center">
          New here?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
