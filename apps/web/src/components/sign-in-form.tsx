"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Key } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, signIn } from "@/lib/auth-client";
import { getCallbackURL } from "@/lib/shared";
import { cn } from "@/lib/utils";
import EmailOtpCard from "./ui/email-otp";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Spinner } from "./ui/spinner";

const SignInFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, startTransition] = useTransition();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [signinEmail, setSigninEmail] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onSubmit: SignInFormSchema,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),

    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await signIn.email(
          {
            email: value.email,
            password: value.password,
            rememberMe: value.rememberMe,
          },
          {
            onRequest: () => {
              setSigninEmail(value.email);
            },
            onError: (context) => {
              toast.error(
                context.error?.message,
                context.error?.message &&
                  context.error?.code === "EMAIL_NOT_VERIFIED"
                  ? {
                      action: {
                        label: "Verify now",
                        onClick: async () => {
                          await authClient.emailOtp.sendVerificationOtp({
                            email: signinEmail,
                            type: "email-verification",
                          });
                          setStep("verify");
                        },
                      },
                    }
                  : {},
              );
            },
            onSuccess: async () => {
              toast.success("Successfully signed in");
              router.push("/dashboard");
            },
          },
        );
      });
    },
  });

  const handlePasskeySignIn = async () => {
    startTransition(async () => {
      await signIn.passkey({
        fetchOptions: {
          onSuccess() {
            toast.success("Successfully signed in");
            router.push("/dashboard");
          },
          onError(context) {
            toast.error(`Authentication failed: ${context.error.message}`);
          },
        },
      });
    });
  };

  const handleSocialSignIn = async (provider: string) => {
    startTransition(async () => {
      await signIn.social({
        provider,
        callbackURL: getCallbackURL(params),
      });
    });
  };

  return (
    <>
      {step === "form" ? (
        <Card className="h-min w-full gap-4 sm:max-w-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              with your account to access WMS or{" "}
              <Link
                className="underline"
                href={{
                  pathname: "sign-up",
                }}
              >
                create a new one.
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              id="sign-in-form"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup className="gap-4">
                <form.Field name="email">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="email"
                          aria-invalid={isInvalid}
                          placeholder="m@example.com"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="password">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <div className="flex items-center">
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <Link
                            href="#"
                            className="ml-auto inline-block text-sm underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="password"
                          aria-invalid={isInvalid}
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="rememberMe">
                  {(field) => {
                    return (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={field.name}
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(!!checked)
                          }
                        />
                        <Label htmlFor={field.name}>Remember me</Label>
                      </div>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="mt-4 grid gap-4">
            <Button
              type="submit"
              form="sign-in-form"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Login"}
            </Button>

            <Button
              variant="secondary"
              disabled={loading}
              className="gap-2"
              onClick={handlePasskeySignIn}
            >
              <Key size={16} />
              Sign-in with Passkey
            </Button>

            <div
              className={cn(
                "flex w-full items-center gap-2",
                "flex-col justify-between",
              )}
            >
              <Button
                variant="outline"
                className={cn("w-full gap-2")}
                disabled={loading}
                onClick={() => handleSocialSignIn("github")}
              >
                <svg
                  role="img"
                  aria-labelledby="github-icon-title"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <title>GitHub</title>
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                  />
                </svg>
                Sign in with Github
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <EmailOtpCard signupEmail={signinEmail} />
      )}
    </>
  );
}
