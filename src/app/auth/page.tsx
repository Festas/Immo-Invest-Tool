"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to home page after successful login/registration
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex min-h-screen items-center justify-center p-4">
        {mode === "login" ? (
          <LoginForm onSuccess={handleSuccess} onRegisterClick={() => setMode("register")} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onLoginClick={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}
