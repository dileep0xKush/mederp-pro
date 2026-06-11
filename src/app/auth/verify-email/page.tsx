"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("your-email@company.com");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pendingVerificationEmail");
    if (saved) setEmail(saved);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setError("");
    setIsLoading(true);

    // Simulate verify
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(false);
    
    // Redirect to login
    alert("Email verification successful! You can now log in.");
    router.push("/auth/login");
  };

  const handleResend = async () => {
    setIsResending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsResending(false);
    alert("A new 6-digit verification code has been sent to " + email);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
        <Mail className="h-6 w-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Verify your email
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          We sent a 6-digit verification code to <br />
          <strong className="text-zinc-800 dark:text-zinc-200">{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            6-Digit Verification Code
          </label>
          <Input
            type="text"
            maxLength={6}
            placeholder="123456"
            className="text-center text-lg tracking-widest font-bold"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").substring(0, 6));
              setError("");
            }}
          />
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          Verify & Activate
          <ShieldCheck className="h-4 w-4 ml-1.5" />
        </Button>
      </form>

      <div className="pt-2 flex flex-col items-center justify-center gap-4 text-sm">
        <div className="text-zinc-500 dark:text-zinc-400">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            {isResending ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : null}
            Resend Code
          </button>
        </div>

        <Link
          href="/auth/register"
          className="inline-flex items-center font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Edit registration info
        </Link>
      </div>
    </div>
  );
}
