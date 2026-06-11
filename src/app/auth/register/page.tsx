"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, Building2, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    companyName: z.string().min(3, { message: "Company name must be at least 3 characters" }),
    userName: z.string().min(3, { message: "User name must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      userName: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    // Save email in local storage to simulate verification flow
    localStorage.setItem("pendingVerificationEmail", data.email);
    router.push("/auth/verify-email");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create company account
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Start your 14-day free trial of MedERP Pro. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Company Name
          </label>
          <Input
            type="text"
            placeholder="Lifecare Distributors Ltd"
            icon={<Building2 className="h-4 w-4" />}
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-xs text-rose-500 mt-1">{errors.companyName.message}</p>
          )}
        </div>

        {/* User Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Your Name
          </label>
          <Input
            type="text"
            placeholder="Dr. Vikram Mehra"
            icon={<User className="h-4 w-4" />}
            {...register("userName")}
          />
          {errors.userName && (
            <p className="text-xs text-rose-500 mt-1">{errors.userName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="name@company.com"
            icon={<Mail className="h-4 w-4" />}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Mobile */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Mobile Number
          </label>
          <Input
            type="text"
            placeholder="+91 98765 43210"
            icon={<Phone className="h-4 w-4" />}
            {...register("mobile")}
          />
          {errors.mobile && (
            <p className="text-xs text-rose-500 mt-1">{errors.mobile.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Confirm Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Register Button */}
        <Button type="submit" className="w-full" loading={isLoading}>
          Create Account
          <UserPlus className="h-4 w-4 ml-1.5" />
        </Button>
      </form>

      <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have a company account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
