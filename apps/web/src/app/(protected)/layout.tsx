/**
 * Protected Layout
 *
 * Note: WorkspaceSync component has been removed as workspace syncing
 * is now handled server-side in proxy.ts middleware. The middleware
 * automatically sets the active organization based on the URL workspace
 * slug before rendering, ensuring server-side consistency.
 */

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
