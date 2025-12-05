"use client";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import SignIn from "@/components/sign-in";

export default function Home() {
  const { data, isPending } = useQuery(convexQuery(api.healthCheck.get, {}));

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col content-center p-4">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-3/4 flex-col gap-6">
          <section className="rounded-lg border p-4">
            <h2 className="mb-2 font-medium">API Status</h2>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isPending
                    ? "bg-yellow-500"
                    : data?.message === "OK"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-muted-foreground text-sm">
                {isPending
                  ? "Checking..."
                  : data?.message === "OK"
                    ? "Connected"
                    : "Disconnected"}
              </span>
            </div>
          </section>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
