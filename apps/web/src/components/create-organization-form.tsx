import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import AvatarUpload from "./avatar-upload";
import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";

const ORG_CREATE_SCHEMA = z.object({
  orgName: z
    .string()
    .min(3, "Organization name is required")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Name can only contain letters, numbers, spaces, and hyphens",
    ),
  orgSlug: z
    .string()
    .min(3, "Organization slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

type OrgCreateForm = z.infer<typeof ORG_CREATE_SCHEMA>;

interface CreateOrganizationFormProps {
  onSuccess?: (orgSlug: string) => void;
  onCancel?: () => void;
  showActions?: boolean;
  formId?: string;
}

export function CreateOrganizationForm({
  onSuccess,
  onCancel,
  showActions = true,
  formId = "org-create-form",
}: CreateOrganizationFormProps) {
  const [isPending, startTransition] = useTransition();

  const validateOrgForm = useCallback(async (value: OrgCreateForm) => {
    const result = ORG_CREATE_SCHEMA.safeParse(value);
    if (!result.success) {
      const errors = z.treeifyError(result.error);
      return {
        fields: {
          orgName: { message: errors.properties?.orgName?.errors[0] },
          orgSlug: { message: errors.properties?.orgSlug?.errors[0] },
        },
      };
    }

    const { data, error } = await authClient.organization.checkSlug({
      slug: value.orgSlug,
    });

    if (error) {
      return {
        fields: {
          orgSlug: { message: [error.message] },
        },
      };
    }

    if (!data.status) {
      return {
        fields: {
          orgSlug: { message: "Organization slug is already taken" },
        },
      };
    }

    return null;
  }, []);

  const createOrgForm = useForm({
    defaultValues: {
      orgName: "",
      orgSlug: "",
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        return new Promise((resolve) => {
          startTransition(async () => {
            const errors = await validateOrgForm(value);
            resolve(errors);
          });
        });
      },
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        const { data, error } = await authClient.organization.create({
          name: value.orgName,
          slug: value.orgSlug,
        });
        if (error) {
          toast.error(error.message || "Failed to create organization");
          return;
        }

        if (!data) {
          toast.error("Failed to create organization");
          return;
        }

        // Success - WorkspaceSync will handle setting active org after navigation
        toast.success("Organization created successfully");
        onSuccess?.(value.orgSlug);
      });
    },
  });

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        createOrgForm.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <createOrgForm.Field name="orgName">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Organization Name</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="text"
                aria-invalid={isInvalid}
                placeholder="Acme Corp"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </createOrgForm.Field>
      <createOrgForm.Field name="orgSlug">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Organization Slug</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                type="text"
                aria-invalid={isInvalid}
                placeholder="acme-corp"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </createOrgForm.Field>
      <Field>
        <FieldLabel>Logo (Optional)</FieldLabel>
        <AvatarUpload />
      </Field>
      {showActions && (
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : "Create"}
          </Button>
        </div>
      )}
    </form>
  );
}

export { ORG_CREATE_SCHEMA };
export type { OrgCreateForm };
