"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import type { Id } from "@wms/backend/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function Page() {
  const { organizationId } = useCurrentUser();
  const [name, setName] = useState("");

  const { data: brands } = useQuery({
    ...convexQuery(api.brands.listAll, {
      organizationId: organizationId as Id<"organizations">,
    }),
    enabled: !!organizationId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.brands.createBrand),
  });

  const handleCreate = () => {
    if (!name.trim() || !organizationId) return;
    mutate(
      { name, organizationId },
      {
        onSuccess: () => setName(""),
      },
    );
  };

  return (
    <>
      <div className="flex gap-2 p-4">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brand name"
          className="rounded border px-3 py-2"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button
          onClick={handleCreate}
          disabled={isPending || !name.trim()}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </div>
      {brands?.map((brand) => (
        <div key={brand._id}>{brand.name}</div>
      ))}
    </>
  );
}
