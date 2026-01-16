"use client";

import { TriangleAlert } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EditorPage } from "@/components/zones/editor-page";

export default function Page() {
  return (
    <div className="flex w-full grow flex-col">
      {/* Mobile warning */}
      <div className="flex flex-1 items-center justify-center md:hidden">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <TriangleAlert />
            </EmptyMedia>
            <EmptyTitle>Mobile Not Supported</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <EmptyDescription>
              This mobile screen size is not supported for this module. Please
              switch to desktop.
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </div>
      {/* Desktop view */}
      <div className="hidden flex-1 md:flex">
        <EditorPage />
      </div>
    </div>
  );
}
