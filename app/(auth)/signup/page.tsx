"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    void data;

    if (error) {
      if (error.message.includes("User already registered")) {
        setErrorMsg("Account already exists");
      } else {
        setErrorMsg(error.message);
      }
      setIsSubmitting(false);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0f172a] border border-gray-800 shadow-lg space-y-6">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-widest">
            Fresh start
          </p>
          <h1 className="text-3xl font-bold mt-1">Signup</h1>
          <p className="text-gray-400 text-sm mt-2">
            Create your account and get access to your workspace
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg border bg-[#020617] border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg border bg-[#020617] border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg transition p-3 font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Signup"}
          </button>

          {errorMsg && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-md text-sm">
              {errorMsg}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login instead
          </Link>
        </p>
      </div>
    </div>
  );
}
