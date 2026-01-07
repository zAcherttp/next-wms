"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";

export function useListSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await authClient.listSessions();
      return (response.data || []).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (token: string) => authClient.revokeSession({ token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const sessionsWithRevoke = sessions.map((session) => ({
    ...session,
    revoke: async () => {
      await revokeMutation.mutateAsync(session.token);
    },
  }));

  return {
    sessions: sessionsWithRevoke,
    isLoading,
  };
}
