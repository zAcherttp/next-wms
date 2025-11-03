"use client";
import { ThemeSwitcher } from "./theme-switcher";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
      <hr />
    </header>
  );
}
