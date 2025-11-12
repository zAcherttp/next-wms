"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { CreateOrganizationForm } from "@/components/create-organization-form";

export default function Page() {
  const { data: userOrganizations } = authClient.useListOrganizations();
  const [showCreateForm, setShowCreateForm] = useState(false);

  function getInitials(str: string) {
    const letters = str.match(/[A-Za-z]/g) || [];
    return letters.slice(0, 2).join("").toUpperCase();
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-full max-w-100 space-y-2">
        {!showCreateForm ? (
          <>
            <span className="flex justify-center pb-4 font-medium text-lg">
              Select an Organization to start
            </span>
            <div className="flex flex-col space-y-2 pb-4">
              {userOrganizations?.map((org) => (
                <Item key={org.id} variant="outline">
                  <ItemMedia>
                    <Avatar className="h-8 w-8 rounded">
                      {org.logo && (
                        <AvatarImage src={org.logo} alt={org.name} />
                      )}
                      <AvatarFallback className="rounded-lg">
                        {getInitials(org.name)}
                      </AvatarFallback>
                    </Avatar>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{org.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Button variant="outline" size="sm">
                      Join
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </div>
            <Separator />
            <span className="flex justify-center pt-4">
              <Button
                className="w-8/10"
                onClick={() => setShowCreateForm(true)}
              >
                Create New Organization
              </Button>
            </span>
          </>
        ) : (
          <>
            <span className="flex justify-center pb-4 font-medium text-lg">
              Create New Organization
            </span>
            <CreateOrganizationForm
              onSuccess={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}
