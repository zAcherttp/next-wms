import { REGEXP_ONLY_DIGITS } from "input-otp";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";
import { Label } from "./label";

interface EmailOtpCardProps {
  signupEmail: string;
}

export default function EmailOtpCard({ signupEmail }: EmailOtpCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [_, setFrom] = useQueryState("from");

  const inputRef = useRef<HTMLInputElement>(null);
  const [otpValue, setOtpValue] = useState("");
  const [loading, startTransition] = useTransition();
  const [countdown, setCountdown] = useState(60);

  const handleOtpComplete = async (completedValue: string) => {
    startTransition(async () => {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: signupEmail,
        otp: completedValue,
      });
      if (error) {
        toast.error(error.message || "Verification failed");
        setOtpValue("");
      } else {
        toast.success("Email verified");
        setFrom(pathname?.split("/").filter(Boolean).pop() ?? "");
        router.refresh();
      }
    });
  };

  const handleOtpResend = async () => {
    startTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: signupEmail,
        type: "email-verification",
      });
      if (error) toast.error(error.message || "Failed to resend");
      else {
        toast.success("Verification code resent");
        setCountdown(60);
      }
    });
  };

  useEffect(() => {
    if (!loading && otpValue === "" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, otpValue]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <Card className="max-w-xs">
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>We sent a 6-digit code to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="otp">Verification code</FieldLabel>
            <InputOTP
              ref={inputRef}
              pattern={REGEXP_ONLY_DIGITS}
              value={otpValue}
              onChange={(v) => setOtpValue(v)}
              onComplete={handleOtpComplete}
              maxLength={6}
              disabled={loading}
              autoFocus
            >
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              Didn&apos;t receive the code?{" "}
              <Button
                onClick={handleOtpResend}
                className="p-0 text-muted-foreground"
                variant={"link"}
                disabled={loading || countdown > 0}
              >
                {countdown > 0 ? `Resend (${countdown}s)` : "Resend"}
              </Button>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
