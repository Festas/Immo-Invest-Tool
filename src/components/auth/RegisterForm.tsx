"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, AlertCircle, Loader2, CheckCircle } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = () => {
    if (username.length < 3) {
      return "Der Benutzername muss mindestens 3 Zeichen lang sein.";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Der Benutzername darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten.";
    }
    return null;
  };

  const validatePassword = () => {
    if (password.length < 8) {
      return "Das Passwort muss mindestens 8 Zeichen lang sein.";
    }
    if (password !== confirmPassword) {
      return "Die Passwörter stimmen nicht überein.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password || !confirmPassword) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    const usernameError = validateUsername();
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          passwordRepeat: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registrierung fehlgeschlagen.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold text-green-600">Registrierung erfolgreich!</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Sie können sich jetzt mit Ihrem Benutzernamen anmelden.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-xl">Konto erstellen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Benutzername <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="username"
                type="text"
                placeholder="benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Mindestens 3 Zeichen, nur Buchstaben, Zahlen, _ und -
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Passwort <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="password"
                type="password"
                placeholder="Mindestens 8 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Passwort bestätigen <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Passwort wiederholen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird registriert...
              </>
            ) : (
              "Registrieren"
            )}
          </Button>

          <div className="text-muted-foreground text-center text-sm">
            Bereits ein Konto?{" "}
            <button type="button" onClick={onLoginClick} className="text-primary hover:underline">
              Anmelden
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
