'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, signOut, type User } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { User as UserIcon, LogOut, ChevronDown, Cloud, CloudOff } from 'lucide-react';

interface UserMenuProps {
  onLoginClick?: () => void;
}

export function UserMenu({ onLoginClick }: UserMenuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    async function loadUser() {
      if (isConfigured) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    }
    loadUser();
  }, [isConfigured]);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudOff className="w-4 h-4" />
        <span className="hidden sm:inline">Offline-Modus</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={onLoginClick}>
        <UserIcon className="w-4 h-4 mr-2" />
        Anmelden
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || user.email}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <UserIcon className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">
            {user.name || user.email.split('@')[0]}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Cloud className="w-3 h-3 text-green-500" />
            Synchronisiert
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-50">
            <div className="p-3 border-b">
              <p className="text-sm font-medium">{user.name || 'Benutzer'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 p-2 text-sm text-left rounded-md hover:bg-muted transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
