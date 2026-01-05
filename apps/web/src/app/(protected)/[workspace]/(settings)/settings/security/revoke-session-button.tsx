"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

interface RevokeSessionButtonProps {
  token: string;
}

export function RevokeSessionButton({ token }: RevokeSessionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRevokeSession = async () => {
    try {
      setIsLoading(true);
      await authClient.revokeSession({ token });
      router.refresh();
    } catch (error) {
      console.error("Failed to revoke session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="ghost" onClick={handleRevokeSession} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Log out"}
    </Button>
  );
}
