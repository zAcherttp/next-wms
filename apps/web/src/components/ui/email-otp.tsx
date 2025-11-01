import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";

interface EmailOtpCardProps {
  signupEmail: string;
}

export default function EmailOtpCard({ signupEmail }: EmailOtpCardProps) {
  const router = useRouter();
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
        router.push("/auth/sign-in");
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">
          We’ve emailed you a verification code
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter the code sent to {signupEmail}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-25 justify-center">
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
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4">
        <Button
          className="w-full"
          onClick={handleOtpResend}
          disabled={loading || countdown > 0}
        >
          {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
        </Button>
      </CardFooter>
    </Card>
  );
}
