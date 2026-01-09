"use client";

import {
  admin,
  getPermissionDisplayKeys,
  member,
  owner,
  permissionDisplayConfig,
  type RoleStatements,
} from "@wms/backend/lib/permissions";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MembersAction } from "@/app/(protected)/[workspace]/(settings)/settings/admin/roles/components/members-action";
import {
  Setting,
  SettingHeader,
  SettingSection,
} from "@/components/settings/setting";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedInput } from "@/hooks/use-debounced-input";
import { useRoles } from "@/hooks/use-roles";
import { useActiveOrganization } from "@/lib/auth/client";
import { fuzzyMatch } from "@/lib/utils";
import { AddMemberDialog } from "./components/add-member-dialog";
import { CreateRoleDialog } from "./components/create-role-dialog";
import { RolesAction } from "./components/roles-action";

const MOCK_MEMBERS = [
  {
    user: {
      _id: "1",
      image: undefined,
      fullName: "John Doe",
      email: "john.doe@example.com",
      role: "owner",
    },
  },
  {
    user: {
      _id: "2",
      image: undefined,
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      role: "admin",
    },
  },
  {
    user: {
      _id: "3",
      image: undefined,
      fullName: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "member",
    },
  },
  {
    user: {
      _id: "4",
      image: undefined,
      fullName: "Bob Johnson 2",
      email: "bob.johnson2@example.com",
      role: "member",
    },
  },
];

const DEFAULT_ROLES = [
  { id: "owner", name: "Owner", role: owner, isDefault: true },
  { id: "admin", name: "Admin", role: admin, isDefault: true },
  { id: "member", name: "Member", role: member, isDefault: true },
];

export default function RolesSettingsPage() {
  const { data: activeOrganization } = useActiveOrganization();
  const { data } = useRoles(activeOrganization?.id);
  const [, roleSearchQuery] = useDebouncedInput("");
  const [
    setPermissionSearchQuery,
    permissionSearchQuery,
    permissionSearchQueryDebounced,
  ] = useDebouncedInput("");
  const [setMemberSearchQuery, memberSearchQuery, memberSearchQueryDebounced] =
    useDebouncedInput("");
  const [tabsValue, setTabsValue] = useState("permissions");
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLES[0]);

  const roles = data?.data;

  const filteredMembers = useMemo(() => {
    const m = selectedRole
      ? MOCK_MEMBERS.filter((mem) => mem.user.role === selectedRole.id)
      : MOCK_MEMBERS;
    if (!memberSearchQueryDebounced.trim()) return m;
    return m.filter(
      (mem) =>
        fuzzyMatch(memberSearchQueryDebounced, mem.user.fullName) ||
        fuzzyMatch(memberSearchQueryDebounced, mem.user.email),
    );
  }, [memberSearchQueryDebounced, selectedRole]);

  const selectedRolePermissions = useMemo<RoleStatements>(
    () => selectedRole?.role.statements || {},
    [selectedRole],
  );

  const filteredPermissions = useMemo(() => {
    if (!permissionSearchQueryDebounced.trim())
      return Object.values(permissionDisplayConfig);

    return Object.values(permissionDisplayConfig)
      .map((section) => {
        if (fuzzyMatch(permissionSearchQueryDebounced, section.label))
          return section;

        const filteredPerms = Object.entries(section.permissions).filter(
          ([, p]) =>
            fuzzyMatch(permissionSearchQueryDebounced, p.label) ||
            fuzzyMatch(permissionSearchQueryDebounced, p.description),
        );

        return filteredPerms.length > 0
          ? { ...section, permissions: Object.fromEntries(filteredPerms) }
          : null;
      })
      .filter(
        (section): section is NonNullable<typeof section> => section !== null,
      );
  }, [permissionSearchQueryDebounced]);

  const filteredPermissionCount = useMemo(
    () =>
      filteredPermissions.reduce(
        (count, section) =>
          count + Object.keys(section?.permissions || {}).length,
        0,
      ),
    [filteredPermissions],
  );

  const SearchInput = ({
    value,
    onChange,
    placeholder,
    count,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    count: number;
  }) => (
    <InputGroup>
      <InputGroupInput
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {value && (
        <InputGroupAddon align="inline-end">{count} results</InputGroupAddon>
      )}
    </InputGroup>
  );

  return (
    <Setting>
      <SettingHeader
        title="Roles Management"
        description="Manage roles and permissions for your organization."
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
        <SettingSection title="Roles" className="flex min-h-0 flex-col">
          <div className="flex min-h-0 flex-1 flex-col space-y-4">
            <div className="flex w-full items-center gap-2">
              <SearchInput
                value={roleSearchQuery}
                onChange={(e) => {}}
                placeholder="Search..."
                count={roles?.length || 0}
              />
              <CreateRoleDialog />
            </div>
            <ScrollArea className="h-[300px] lg:h-[calc(100vh-20rem)]">
              <div className="space-y-2">
                {DEFAULT_ROLES.map((role) => (
                  <Item
                    key={role.id}
                    className="cursor-pointer py-2"
                    variant={selectedRole?.id === role.id ? "muted" : "default"}
                    onClick={() => setSelectedRole(role)}
                  >
                    <ItemContent>
                      <ItemTitle>{role.name}</ItemTitle>
                      <ItemDescription>
                        {role.isDefault ? "Default role" : "Custom role"}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <RolesAction roleId={role.id} />
                    </ItemActions>
                  </Item>
                ))}
                {roles?.map((role) => (
                  <Item key={role.id} className="py-2">
                    <ItemContent>
                      <ItemTitle>{role.role}</ItemTitle>
                      <ItemDescription>Custom role</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <RolesAction roleId={role.id} />
                    </ItemActions>
                  </Item>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SettingSection>

        <SettingSection title="Details" className="flex min-h-0 flex-col">
          <Tabs
            defaultValue="permissions"
            onValueChange={setTabsValue}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="mb-2 w-full">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <div className="flex w-full items-center gap-2">
              <SearchInput
                value={
                  tabsValue === "permissions"
                    ? permissionSearchQuery
                    : memberSearchQuery
                }
                onChange={(e) =>
                  (tabsValue === "permissions"
                    ? setPermissionSearchQuery
                    : setMemberSearchQuery)(e.target.value)
                }
                placeholder={
                  tabsValue === "permissions"
                    ? "Search permissions..."
                    : "Search members..."
                }
                count={
                  tabsValue === "permissions"
                    ? filteredPermissionCount
                    : filteredMembers.length
                }
              />
              {tabsValue === "members" && <AddMemberDialog />}
            </div>

            <TabsContent
              value="permissions"
              className="flex flex-1 flex-col overflow-hidden data-[state=active]:flex"
            >
              <ScrollArea className="h-[calc(100vh-18rem)]">
                <div className="py-4">
                  {filteredPermissions.map((section) => (
                    <div key={section.label} className="mb-6">
                      <h3 className="mb-2 font-semibold">{section.label}</h3>
                      <div className="space-y-1">
                        {Object.entries(section.permissions).map(
                          ([key, permission]) => {
                            // Check if this permission is enabled for selected role
                            const resource = getPermissionDisplayKeys().find(
                              (r) => permissionDisplayConfig[r] === section,
                            );
                            const isEnabled =
                              resource &&
                              selectedRolePermissions[resource]?.includes(key);

                            return (
                              <Item className="py-2" key={key}>
                                <ItemContent>
                                  <ItemTitle>{permission.label}</ItemTitle>
                                  <ItemDescription>
                                    {permission.description}
                                  </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                  <Switch checked={isEnabled} />
                                </ItemActions>
                              </Item>
                            );
                          },
                        )}
                      </div>
                    </div>
                  ))}
                  {!filteredPermissions.length && (
                    <p className="p-4 text-center text-muted-foreground text-sm">
                      No permissions found matching "{permissionSearchQuery}"
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent
              value="members"
              className="flex flex-1 flex-col overflow-hidden data-[state=active]:flex"
            >
              <ScrollArea className="h-[calc(100vh-18rem)]">
                <div className="space-y-2 py-4">
                  {filteredMembers.map((member) => {
                    const initials = member.user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <Item key={member.user._id} className="py-2">
                        <ItemContent>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <ItemTitle>{member.user.fullName}</ItemTitle>
                              <ItemDescription>
                                {member.user.email}
                              </ItemDescription>
                            </div>
                          </div>
                        </ItemContent>
                        <ItemActions>
                          <MembersAction
                            memberId={member.user._id}
                            memberName={member.user.fullName}
                            roleId={selectedRole?.id || "N/A"}
                            roleName={selectedRole?.name || "N/A"}
                          />
                        </ItemActions>
                      </Item>
                    );
                  })}
                  {!filteredMembers.length && (
                    <p className="p-4 text-center text-muted-foreground text-sm">
                      No members found matching "{memberSearchQuery}"
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </SettingSection>
      </div>
    </Setting>
  );
}
