"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Bitte füllen Sie alle Felder aus.");
      setIsLoading(false);
      return;
    }

    const { user, error: authError } = await signIn({ email, password });

    setIsLoading(false);

    if (authError) {
      setError(authError.message || "Anmeldung fehlgeschlagen.");
      return;
    }

    if (user) {
      onSuccess?.();
    }
  };

  if (!isConfigured) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">Anmeldung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">Cloud-Sync nicht konfiguriert</p>
              <p className="mt-1 text-yellow-600 dark:text-yellow-400">
                Die Anwendung verwendet lokalen Speicher. Um Cloud-Sync zu aktivieren, konfigurieren
                Sie die Supabase-Umgebungsvariablen.
              </p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 w-full" onClick={onSuccess}>
            Ohne Anmeldung fortfahren
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-xl">Anmelden</CardTitle>
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
            <label htmlFor="email" className="text-sm font-medium">
              E-Mail
            </label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Passwort
            </label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird angemeldet...
              </>
            ) : (
              "Anmelden"
            )}
          </Button>

          <div className="text-muted-foreground text-center text-sm">
            Noch kein Konto?{" "}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-primary hover:underline"
            >
              Registrieren
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
