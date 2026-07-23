"use client";

import type { ReactNode } from "react";
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context";
import { OnboardingProvider } from "@/contexts/onboarding-context";
import { MainProvider } from "@/contexts/main-context";
import { AuthLoadingScreen } from "./auth-loading-screen";

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = usePiAuth();
  if (!isAuthenticated) return <AuthLoadingScreen />;
  return <>{children}</>;
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <OnboardingProvider>
        <MainProvider>
          <AppContent>{children}</AppContent>
        </MainProvider>
      </OnboardingProvider>
    </PiAuthProvider>
  );
}