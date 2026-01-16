/**
 * AttributeField - Dynamic form field renderer based on AttributeUIConfig
 * Auto-generates correct input type based on schema definition
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { AttributeUIConfig } from "@/lib/types/layout-editor/attribute-registry";

// ============================================================================
// Types
// ============================================================================

interface AttributeFieldProps {
  config: AttributeUIConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  /** Validation error message to display */
  error?: string;
}

interface Vector3Value {
  x: number;
  y: number;
  z: number;
}

interface DimensionsValue {
  width: number;
  height?: number;
  depth?: number;
  length?: number;
}

// ============================================================================
// Sub-Components
// ============================================================================

function PositionInput({
  value,
  onChange,
  disabled,
}: {
  value: Vector3Value;
  onChange: (v: Vector3Value) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["x", "y", "z"] as const).map((axis) => (
        <div key={axis} className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-xs uppercase">
            {axis}
          </Label>
          <Input
            step={0.1}
            value={value?.[axis] ?? 0}
            onChange={(e) =>
              onChange({
                ...value,
                [axis]: Number.parseFloat(e.target.value) || 0,
              })
            }
            disabled={disabled}
            className="h-8"
          />
        </div>
      ))}
    </div>
  );
}

function RotationInput({
  value,
  onChange,
  disabled,
}: {
  value: Vector3Value;
  onChange: (v: Vector3Value) => void;
  disabled?: boolean;
}) {
  // Convert radians to degrees for display
  const toDeg = (rad: number) => Math.round((rad * 180) / Math.PI);
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div className="grid grid-cols-3 gap-2">
      {(["x", "y", "z"] as const).map((axis) => (
        <div key={axis} className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-xs uppercase">
            {axis}°
          </Label>
          <Input
            type="number"
            step={15}
            value={toDeg(value?.[axis] ?? 0)}
            onChange={(e) =>
              onChange({
                ...value,
                [axis]: toRad(Number.parseFloat(e.target.value) || 0),
              })
            }
            disabled={disabled}
            className="h-8"
          />
        </div>
      ))}
    </div>
  );
}

function DimensionsInput({
  value,
  onChange,
  disabled,
}: {
  value: DimensionsValue;
  onChange: (v: DimensionsValue) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["width", "height", "depth"] as const).map((dim) => (
        <div key={dim} className="flex flex-col gap-1">
          <Label className="text-muted-foreground text-xs capitalize">
            {dim[0]}
          </Label>
          <Input
            type="number"
            step={0.1}
            min={0.1}
            value={value?.[dim] ?? 0}
            onChange={(e) =>
              onChange({
                ...value,
                [dim]: Number.parseFloat(e.target.value) || 0.1,
              })
            }
            disabled={disabled}
            className="h-8"
          />
        </div>
      ))}
    </div>
  );
}

function RangeInput({
  value,
  onChange,
  min = 0,
  max = 100,
  unit,
  disabled,
}: {
  value: { min: number; max: number } | undefined;
  onChange: (v: { min: number; max: number }) => void;
  min?: number;
  max?: number;
  unit?: string;
  disabled?: boolean;
}) {
  const current = value ?? { min: min, max: max };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-muted-foreground text-xs">
        <span>
          Min: {current.min}
          {unit}
        </span>
        <span>
          Max: {current.max}
          {unit}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[current.min, current.max]}
        onValueChange={([minVal, maxVal]) =>
          onChange({ min: minVal, max: maxVal })
        }
        disabled={disabled}
      />
    </div>
  );
}

function ColorInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="color"
        value={value || "#888888"}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-8 w-10 cursor-pointer rounded border"
      />
      <Input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="#RRGGBB"
        className="h-8 flex-1"
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AttributeField({
  config,
  value,
  onChange,
  disabled,
  error,
}: AttributeFieldProps) {
  const {
    key,
    label,
    type,
    required,
    min,
    max,
    step,
    options,
    unit,
    description,
  } = config;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={key} className="font-medium text-sm">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
      </div>

      {/* Render appropriate input based on type */}
      {type === "string" && (
        <Input
          id={key}
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={config.placeholder}
        />
      )}

      {type === "number" && (
        <Input
          id={key}
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={(value as number) ?? 0}
          onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
          disabled={disabled}
        />
      )}

      {type === "boolean" && (
        <Switch
          id={key}
          checked={(value as boolean) ?? false}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      )}

      {type === "position" && (
        <PositionInput
          value={value as Vector3Value}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {type === "rotation" && (
        <RotationInput
          value={value as Vector3Value}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {type === "dimensions" && (
        <DimensionsInput
          value={value as DimensionsValue}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {type === "range" && (
        <RangeInput
          value={value as { min: number; max: number }}
          onChange={onChange}
          min={min}
          max={max}
          unit={unit}
          disabled={disabled}
        />
      )}

      {type === "select" && options && (
        <Select
          value={(value as string) ?? ""}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={key}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === "color" && (
        <ColorInput
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

export default AttributeField;
