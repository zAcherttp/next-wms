"use client";

import { Building2, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { organization } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-queries";

type InvitationStatus =
  | "loading"
  | "accepting"
  | "success"
  | "error"
  | "login-required";

interface InvitationDetails {
  organizationName?: string;
  role?: string;
  email?: string;
}

export default function AcceptInvitationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [status, setStatus] = useState<InvitationStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<InvitationDetails>({});

  const invitationId = params?.id;

  useEffect(() => {
    if (sessionLoading) return;

    // If not logged in, redirect to sign-in with return URL
    if (!session?.user) {
      setStatus("login-required");
      return;
    }

    // Accept the invitation
    const acceptInvitation = async () => {
      if (!invitationId) {
        setStatus("error");
        setError("Invalid invitation link");
        return;
      }

      try {
        setStatus("accepting");
        const result = await organization.acceptInvitation({
          invitationId,
        });

        if (result.error) {
          setStatus("error");
          setError(result.error.message ?? "Failed to accept invitation");
          return;
        }

        // Set organization as active
        if (result.data?.member?.organizationId) {
          await organization.setActive({
            organizationId: result.data.member.organizationId,
          });
        }

        setDetails({
          organizationName: undefined, // Organization name not available in response
          role: result.data?.member?.role,
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Failed to accept invitation",
        );
      }
    };

    acceptInvitation();
  }, [invitationId, session?.user, sessionLoading]);

  const handleSignIn = () => {
    // Redirect to sign-in with return URL
    const returnUrl = encodeURIComponent(
      `/auth/accept-invitation/${invitationId}`,
    );
    router.push(`/auth/sign-in?returnUrl=${returnUrl}`);
  };

  const handleGoToWorkspace = () => {
    router.push("/");
  };

  if (status === "loading" || status === "accepting") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {status === "loading"
                ? "Loading invitation..."
                : "Accepting invitation..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "login-required") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="size-6 text-primary" />
            </div>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to accept this workspace invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={handleSignIn} className="w-full">
              Sign In to Continue
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              Don't have an account?{" "}
              <a
                href={`/auth/sign-up?returnUrl=${encodeURIComponent(`/auth/accept-invitation/${invitationId}`)}`}
                className="text-primary hover:underline"
              >
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="size-6 text-destructive" />
            </div>
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Welcome to the Team!</CardTitle>
            <CardDescription>
              You've successfully joined{" "}
              <strong>{details.organizationName ?? "the workspace"}</strong>
              {details.role && (
                <>
                  {" "}
                  as <strong>{details.role}</strong>
                </>
              )}
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={handleGoToWorkspace} className="w-full">
              Go to Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
