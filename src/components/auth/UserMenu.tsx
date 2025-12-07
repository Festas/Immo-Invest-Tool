"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User as UserIcon, LogOut, ChevronDown, Cloud } from "lucide-react";

interface User {
  id: string;
  username: string;
}

interface UserMenuProps {
  onLoginClick?: () => void;
}

export function UserMenu({ onLoginClick }: UserMenuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      setIsOpen(false);
      // Refresh the page to clear any cached state
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />;
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
          <UserIcon className="text-primary h-4 w-4" />
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium">{user.username}</p>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <Cloud className="h-3 w-3 text-green-500" />
            Angemeldet
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="bg-card absolute right-0 z-50 mt-2 w-56 rounded-lg border shadow-lg">
            <div className="border-b p-3">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-muted-foreground text-xs">Benutzer</p>
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
