"use client";

import { ReturnRequestsTable } from "@/components/table/return-request-table";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-2">
      <ReturnRequestsTable />
    </div>
  );
}
