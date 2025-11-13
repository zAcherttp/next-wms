import { WorkspaceSync } from "@/components/workspace-sync";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <WorkspaceSync />
      {children}
    </>
  );
}
