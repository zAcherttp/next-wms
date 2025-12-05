"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-queries";
import { AvatarUploadField } from "./avatar-upload-field";

interface ProfileFormValues {
  name: string;
  email: string;
  image: string | null;
}

interface ProfileFormProps {
  /** Additional class name */
  className?: string;
}

/**
 * Profile form component for updating user profile information.
 * Integrates with Better Auth for profile updates.
 */
export function ProfileForm({ className }: ProfileFormProps) {
  // Use React Query hooks instead of Zustand store
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;
  const sessionLoading = isPending;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    name: "",
    email: "",
    image: null,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form values from store user
  useEffect(() => {
    if (user) {
      setFormValues({
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? null,
      });
    }
  }, [user]);

  // Track changes
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setFormValues((prev) => ({ ...prev, name: newName }));
      setHasChanges(newName !== (user?.name ?? ""));
    },
    [user?.name],
  );

  const handleAvatarUpdated = useCallback((url: string | null) => {
    setFormValues((prev) => ({ ...prev, image: url }));
    // Avatar is updated immediately, no need to track changes
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    try {
      setIsSubmitting(true);
      await authClient.updateUser({
        name: formValues.name,
      });
      setHasChanges(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <AvatarUploadField
            currentAvatar={formValues.image ?? undefined}
            onAvatarUpdated={handleAvatarUpdated}
          />
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            type="text"
            value={formValues.name}
            onChange={handleNameChange}
            placeholder="Enter your name"
            maxLength={100}
          />
          <p className="text-muted-foreground text-sm">
            This is the name that will be displayed to other workspace members.
          </p>
        </div>

        {/* Email Field (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formValues.email}
            disabled
            className="bg-muted"
          />
          <p className="text-muted-foreground text-sm">
            Your email address is used for sign-in and cannot be changed here.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={!hasChanges || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
