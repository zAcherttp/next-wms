"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [otpValue, setOtpValue] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleOtpChange = (newValue: string) => {
    setOtpValue(newValue);
  };

  const handleOtpComplete = async (completedValue: string) => {
    setDisabled(true);

    const { data, error } = await authClient.emailOtp.verifyEmail({
      email: "",
      otp: completedValue,
    });

    console.log({ data, error });

    setDisabled(false);
    setOtpValue("");
  };

  useEffect(() => {
    if (!disabled && otpValue === "" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, otpValue]);

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="h-min w-full gap-4 sm:max-w-md">
        <CardHeader className="text-center font-bold text-xl">
          We’ve emailed you a verification code
        </CardHeader>
        <CardContent className="flex h-25 justify-center">
          <InputOTP
            ref={inputRef}
            pattern={REGEXP_ONLY_DIGITS}
            value={otpValue}
            onChange={handleOtpChange}
            onComplete={handleOtpComplete}
            maxLength={6}
            disabled={disabled}
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
      </Card>
    </div>
  );
}
