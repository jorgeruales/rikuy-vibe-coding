"use client";

import { useState, useEffect } from "react";
import HomePage from '@/components/moneywise/home-page';
import { PinLoginPage } from "@/components/auth/pin-login";
import { RegisterPage } from "@/components/auth/register-page";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [view, setView] = useState<"login" | "register" | "home">("login");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Check if we have a saved user session (we won't use default auth auto-login, we want PIN every time! Wait, user said "A partir de ahora, cunado el sistema se carge en el navegador, lo primero que se pedira sera el pin". So we always start at login, even if Firebase auth is kept.
    // We just stop loading.
    setIsAuthLoading(false);
  }, []);

  if (isAuthLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>;
  }

  if (view === "register") {
    return <RegisterPage onSwitchToLogin={() => setView("login")} />;
  }

  if (view === "login" || !userId) {
    return <PinLoginPage
      onSwitchToRegister={() => setView("register")}
      onLoginSuccess={(uid) => {
        setUserId(uid);
        setView("home");
      }}
    />;
  }

  return <HomePage userId={userId} onLogout={() => { setUserId(null); setView("login"); }} />;
}
