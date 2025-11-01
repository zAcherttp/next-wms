"use client";

import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { authClient, signUp } from "@/lib/auth-client";
import EmailOtpCard from "./ui/email-otp";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";

const SignUpFormSchema = z
  .object({
    name: z.string().min(3, "Name is required").max(50, "Name is too long"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirmation: z
      .string()
      .min(8, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export default function SignUpForm() {
  const [loading, startTransition] = useTransition();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [signupEmail, setSignupEmail] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    validators: {
      onSubmit: SignUpFormSchema,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),

    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/dashboard",
          fetchOptions: {
            onError: (context) => {
              toast.error(context.error.message);
            },
            onSuccess: async () => {
              setSignupEmail(value.email);
              await authClient.emailOtp.sendVerificationOtp({
                email: value.email,
                type: "email-verification",
              });
              setStep("confirm");
            },
          },
        });
      });
    },
  });

  return (
    <>
      {step === "form" ? (
        <Card className="h-min w-full gap-4 sm:max-w-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              or go back to{" "}
              <Link
                className="underline"
                href={{
                  pathname: "sign-in",
                }}
              >
                sign in
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              id="sign-up-form"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup className="gap-4">
                <form.Field name="name">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="text"
                          aria-invalid={isInvalid}
                          placeholder="John Doe"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

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
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="password"
                          aria-invalid={isInvalid}
                          placeholder="••••••••"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="passwordConfirmation">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid} className="gap-2">
                        <FieldLabel htmlFor={field.name}>
                          Confirm Password
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="password"
                          aria-invalid={isInvalid}
                          placeholder="••••••••"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              className="flex flex-1"
              type="submit"
              form="sign-up-form"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <EmailOtpCard signupEmail={signupEmail} />
      )}
    </>
  );
}
