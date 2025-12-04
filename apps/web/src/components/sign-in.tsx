"use client";

import Link from "next/link";
import { selectStatus, selectUser, useGlobalStore } from "@/stores";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface SignInProps {
  className?: string;
}

export default function SignIn(props: SignInProps) {
  // Use Zustand store instead of Better Auth hook
  const user = useGlobalStore(selectUser);
  const status = useGlobalStore(selectStatus);
  const isPending = status === "loading" || status === "idle";

  if (isPending) {
    return (
      <Button variant="outline" disabled>
        <Spinner className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button className={props.className} variant="outline" asChild>
      {user ? (
        <Link href="/dashboard">Go to Dashboard</Link>
      ) : (
        <Link href="/auth/sign-in">Sign In</Link>
      )}
    </Button>
  );
}
