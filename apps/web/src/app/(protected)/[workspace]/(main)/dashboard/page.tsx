"use client";

import { MoreHorizontal } from "lucide-react";
import { ChartDataCard } from "@/components/chart-data-card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  dashboardCardsData,
  defaultChartData,
} from "@/mock/data/dashboard-charts";
import { useChartStore } from "@/store/chart";
import { useDateFilterStore } from "@/store/date-filter";

export default function Page() {
  const lineType = useChartStore((state) => state.lineType);
  const setLineType = useChartStore((state) => state.setLineType);
  const projectionStyle = useChartStore((state) => state.projectionStyle);
  const setProjectionStyle = useChartStore((state) => state.setProjectionStyle);

  const selectedPreset = useDateFilterStore((state) => state.selectedPreset);
  const periodLabel = useDateFilterStore((state) => state.periodLabel);
  const updateFromPicker = useDateFilterStore(
    (state) => state.updateFromPicker,
  );

  // Get chart data based on selected preset, fallback to default for custom range
  const cardsData = selectedPreset
    ? dashboardCardsData[selectedPreset]
    : defaultChartData;

  return (
    <div className="flex flex-col gap-4">
      {/* Header with date picker and chart settings */}
      <div className="flex flex-row items-center justify-between">
        <DateRangePicker
          align="start"
          showCompare={false}
          onUpdate={(data) => {
            updateFromPicker({
              range: data.range,
              preset: data.preset,
              periodLabel: data.periodLabel,
            });
          }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="size-8">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Line Style</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={lineType === "linear"}
                onCheckedChange={(checked) => {
                  if (checked) setLineType("linear");
                }}
              >
                Linear
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={lineType === "monotone"}
                onCheckedChange={(checked) => {
                  if (checked) setLineType("monotone");
                }}
              >
                Smooth
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <Separator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Projection Style</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={projectionStyle === "area"}
                onCheckedChange={(checked) => {
                  if (checked) setProjectionStyle("area");
                }}
              >
                Area (±25%)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={projectionStyle === "line"}
                onCheckedChange={(checked) => {
                  if (checked) setProjectionStyle("line");
                }}
              >
                Line
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dashboard Cards - data changes based on selected date range */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardsData.map((card) => (
          <ChartDataCard
            key={card.title}
            title={card.title}
            value={card.value}
            changePercent={card.changePercent}
            isPositive={card.isPositive}
            periodLabel={periodLabel}
            data={card.data}
            color={card.color}
          />
        ))}
      </div>
    </div>
  );
}
