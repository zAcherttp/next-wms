"use client";

import { SettingsSidebar } from "@/components/settings-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}

export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  // const { data: activeOrg, isPending } = useActiveOrganization();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={true}>
      <SettingsSidebar />
      <SidebarInset>
        <ScrollArea className="max-h-screen">
          <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full flex-row items-center justify-between px-4 transition-[padding] group-has-data-[collapsible=icon]/sidebar-wrapper:px-2">
              {isMobile && <SidebarTrigger className="size-8" />}
            </div>
          </header>
          <div className="flex flex-col gap-2">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
