"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexClientProvider } from "@/components/providers/convex-client-providers";
import { GlobalStateProvider } from "@/components/providers/global-state-provider";
import { Toaster } from "../ui/sonner";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <GlobalStateProvider>
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
