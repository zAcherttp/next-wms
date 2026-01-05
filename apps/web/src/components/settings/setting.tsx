import type { ReactNode } from "react";

/**
 * Setting - Top-level container for settings pages
 * Provides consistent spacing between header and sections
 */
export function Setting({ children }: { children: ReactNode }) {
  return <div className="space-y-6 pb-16">{children}</div>;
}

/**
 * SettingHeader - Page title and description
 * Use once at the top of each settings page
 */
export function SettingHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <span className="font-semibold text-2xl">{title}</span>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}

/**
 * SettingSection - Individual section within a settings page
 * Contains a title/description and the actual content as children
 */
export function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
