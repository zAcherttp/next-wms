"use client";

import { ReturnRequestsTable } from "@/components/table/return-request-table";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">
            Return Requests
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage return requests to suppliers
          </p>
        </div>
      </div>
      <ReturnRequestsTable />
    </div>
  );
}
