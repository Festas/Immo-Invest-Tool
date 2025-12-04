"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, signOut, type User } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { User as UserIcon, LogOut, ChevronDown, Cloud, CloudOff } from "lucide-react";

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
    return <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />;
  }

  if (!isConfigured) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <CloudOff className="h-4 w-4" />
        <span className="hidden sm:inline">Offline-Modus</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={onLoginClick}>
        <UserIcon className="mr-2 h-4 w-4" />
        Anmelden
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted flex items-center gap-2 rounded-lg p-2 transition-colors"
      >
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || user.email}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <UserIcon className="text-primary h-4 w-4" />
          )}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium">{user.name || user.email.split("@")[0]}</p>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Cloud className="h-3 w-3 text-green-500" />
            Synchronisiert
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="bg-card absolute right-0 z-50 mt-2 w-56 rounded-lg border shadow-lg">
            <div className="border-b p-3">
              <p className="text-sm font-medium">{user.name || "Benutzer"}</p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={handleSignOut}
                className="hover:bg-muted flex w-full items-center gap-2 rounded-md p-2 text-left text-sm text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
