"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoles } from "@/hooks/use-roles";
import { useActiveOrganization } from "@/lib/auth/client";

export default function RolesSettingsPage() {
  const { data: activeOrganization } = useActiveOrganization();
  const organizationId = activeOrganization?.id;
  const { data, isLoading, error } = useRoles(organizationId);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  const roles = data?.data;

  const searchResultsCount = roles ? roles.length : 0;

  return (
    <Setting>
      <SettingHeader
        title="Roles Management"
        description="Manage roles and permissions for your organization."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SettingSection title="Roles">
          <div className="space-y-4">
            <div className="flex w-full items-center gap-2 lg:max-w-sm">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search..."
                  value={roleSearchQuery}
                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                {roleSearchQuery !== "" && (
                  <InputGroupAddon align="inline-end">
                    {searchResultsCount} results
                  </InputGroupAddon>
                )}
              </InputGroup>
              <Button>
                <Plus />
                Create Role
              </Button>
            </div>
            <ScrollArea className="h-[200px] lg:max-h-full">
              <div className="space-y-2 pr-4">
                {roles?.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between rounded-md border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-sm">{role.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Button variant={"ghost"}>⋯</Button>
                    </div>
                  </div>
                ))}
                {!roles || roles.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground text-sm">
                    No roles found for this organization.
                  </p>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </SettingSection>
        <SettingSection title="Details">
          <Tabs defaultValue="permissions">
            <TabsList className="mb-2 w-full">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>

              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <TabsContent value="permissions">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Product Management</h4>
                {/* Add permission toggles here */}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Inventory Management</h4>
                {/* Add permission toggles here */}
              </div>
            </TabsContent>
            <TabsContent value="members">PLACEHOLDER TEXT</TabsContent>
          </Tabs>
        </SettingSection>
      </div>
    </Setting>
  );
}
