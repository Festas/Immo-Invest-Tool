'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    }
    if (password !== confirmPassword) {
      return 'Die Passwörter stimmen nicht überein.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    const { user, error: authError } = await signUp({
      email,
      password,
      name: name || undefined,
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message || 'Registrierung fehlgeschlagen.');
      return;
    }

    if (user) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    }
  };

  if (!isConfigured) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-center">Registrierung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">Cloud-Sync nicht konfiguriert</p>
              <p className="mt-1 text-yellow-600 dark:text-yellow-400">
                Registrierung ist nicht verfügbar. Die Anwendung verwendet lokalen Speicher.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={onLoginClick}
          >
            Zurück zur Anmeldung
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-600">Registrierung erfolgreich!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">Konto erstellen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Ihr Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-Mail <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Passwort <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird registriert...
              </>
            ) : (
              'Registrieren'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Bereits ein Konto?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-primary hover:underline"
            >
              Anmelden
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
