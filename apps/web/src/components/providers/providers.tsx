"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexClientProvider } from "@/components/providers/convex-client-providers";
import {
  GlobalStateProvider,
  type InitialAuthState,
} from "@/components/providers/global-state-provider";
import { Toaster } from "../ui/sonner";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
  initialAuthState?: InitialAuthState | null;
}

export default function Providers({
  children,
  initialAuthState,
}: ProvidersProps) {
  return (
    <ConvexClientProvider>
      <GlobalStateProvider initialAuthState={initialAuthState}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster richColors />
        </ThemeProvider>
      </GlobalStateProvider>
    </ConvexClientProvider>
  );
}
