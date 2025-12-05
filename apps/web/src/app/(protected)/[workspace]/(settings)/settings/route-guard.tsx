"use client";

import { Loader2, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";

interface RouteGuardProps {
  children: React.ReactNode;
  allowed: boolean;
  isLoading?: boolean;
  workspace: string;
}

/**
 * Client-side route guard that shows access denied or loading states.
 */
export function RouteGuard({
  children,
  allowed,
  isLoading = false,
  workspace,
}: RouteGuardProps) {
  const router = useRouter();

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have permission
  if (!allowed) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <ShieldX className="size-12 text-destructive" />
          <h2 className="font-semibold text-foreground text-xl">
            Access Denied
          </h2>
          <p className="max-w-md text-center">
            You don't have permission to access this settings page.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${workspace}/settings/profile`)}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
