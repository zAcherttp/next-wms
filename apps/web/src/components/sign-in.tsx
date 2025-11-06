"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface SignInProps {
  className?: string;
}

export default function SignIn(props: SignInProps) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button variant="outline" disabled>
        <Spinner className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button className={props.className} variant="outline" asChild>
      {session ? (
        <Link href="/dashboard">Go to Dashboard</Link>
      ) : (
        <Link href="/auth/sign-in">Sign In</Link>
      )}
    </Button>
  );
}
