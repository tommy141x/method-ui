import type { JSX, Component } from "solid-js";
import { createSignal } from "solid-js";
import { AngleSlider as ArkAngleSlider } from "@ark-ui/solid/angle-slider";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

type AngleSliderProps = {
  defaultValue?: number;
  value?: number;
  onValueChange?: (details: { value: number }) => void;
  onValueChangeEnd?: (details: { value: number }) => void;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  class?: string;
  label?: JSX.Element;
  showValue?: boolean;
  showMarkers?: boolean;
  markers?: number[];
  centerValue?:
    | boolean
    | JSX.Element
    | ((context: { value: number; valueAsDegree: string }) => JSX.Element);
  size?: number;
  thickness?: number;
};

export const AngleSlider: Component<AngleSliderProps> = (props) => {
  const defaultMarkers = [0, 45, 90, 135, 180, 225, 270, 315];
  const markers = props.markers || (props.showMarkers ? defaultMarkers : []);
  const size = props.size || 200;
  const thickness = props.thickness || 16;
  const thumbSize = 20;

  return (
    <ArkAngleSlider.Root
      defaultValue={props.defaultValue}
      value={props.value}
      onValueChange={props.onValueChange}
      onValueChangeEnd={props.onValueChangeEnd}
      step={props.step}
      disabled={props.disabled}
      readOnly={props.readOnly}
      invalid={props.invalid}
      name={props.name}
      id={props.id}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      class={cn("relative flex flex-col gap-3 w-full", props.class)}
      style={{
        "--size": `${size}px`,
        "--thickness": `${thickness}px`,
      }}
    >
      {(props.label || (props.showValue && !props.centerValue)) && (
        <div class="flex items-center justify-between">
          {props.label && (
            <ArkAngleSlider.Label class="text-sm font-medium leading-none">
              {props.label}
            </ArkAngleSlider.Label>
          )}
          {props.showValue && !props.centerValue && (
            <ArkAngleSlider.ValueText class="text-sm text-muted-foreground" />
          )}
        </div>
      )}
      <div class="flex items-center justify-center">
        <div
          class="relative flex items-center justify-center"
          style={{
            width: "var(--size)",
            height: "var(--size)",
          }}
        >
          <ArkAngleSlider.Control
            class="absolute inset-0"
            style={{
              "touch-action": "none",
              "user-select": "none",
              "-webkit-user-select": "none",
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              class="overflow-visible"
            >
              <title>Angle Slider</title>
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={(size - thickness) / 2}
                fill="transparent"
                stroke="currentColor"
                stroke-width={thickness}
                class="text-secondary"
              />
              {/* Value arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={(size - thickness) / 2}
                fill="transparent"
                stroke="currentColor"
                stroke-width={thickness}
                stroke-linecap="round"
                class={cn(
                  "text-primary transition-opacity",
                  props.disabled && "opacity-50",
                )}
                style={{
                  "--radius": `${(size - thickness) / 2}px`,
                  "--circumference": `${2 * Math.PI * ((size - thickness) / 2)}px`,
                  "--percent": "calc(var(--value, 0) / 360 * 100)",
                  "stroke-dasharray": "var(--circumference)",
                  "stroke-dashoffset":
                    "calc(var(--circumference) * (100 - var(--percent)) / 100)",
                  "transform-origin": "center",
                  transform: "rotate(-90deg)",
                }}
              />
            </svg>
            {/* Markers */}
            {markers.length > 0 && (
              <ArkAngleSlider.MarkerGroup
                class="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: 0,
                  top: 0,
                }}
              >
                {markers.map((value) => {
                  const angle = (value * Math.PI) / 180 - Math.PI / 2;
                  const markerRadius = (size - thickness) / 2;
                  const centerX = size / 2;
                  const centerY = size / 2;
                  const markerSize = 8; // 2 * 4 (w-2 = 0.5rem = 8px)
                  const x =
                    centerX + Math.cos(angle) * markerRadius - markerSize / 2;
                  const y =
                    centerY + Math.sin(angle) * markerRadius - markerSize / 2;
                  return (
                    <ArkAngleSlider.Marker
                      value={value}
                      class="absolute w-2 h-2 rounded-full bg-muted-foreground/40 data-[state=at-value]:bg-primary data-[state=under-value]:bg-primary/60 "
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                      }}
                    />
                  );
                })}
              </ArkAngleSlider.MarkerGroup>
            )}
            {/* Thumb */}
            <ArkAngleSlider.Thumb
              class="absolute inset-0 flex items-start justify-center pointer-events-none focus-visible:outline-none"
              style={{
                rotate: "var(--angle, 0deg)",
              }}
            >
              <div
                class="flex flex-col items-center"
                style={{
                  transform: `translateY(${thickness / 2 - thumbSize / 2}px)`,
                }}
              >
                <div
                  class={cn(
                    "rounded-full bg-background border-2 border-primary shadow-lg transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[invalid]:border-destructive",
                    !props.disabled && "hover:scale-110",
                    props.disabled && "pointer-events-none",
                  )}
                  style={{
                    width: `${thumbSize}px`,
                    height: `${thumbSize}px`,
                  }}
                />
              </div>
            </ArkAngleSlider.Thumb>
          </ArkAngleSlider.Control>
          {props.centerValue && (
            <ArkAngleSlider.Context>
              {(context) => (
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {typeof props.centerValue === "boolean" ? (
                    <div class="text-4xl font-bold text-primary">
                      {context().value}°
                    </div>
                  ) : typeof props.centerValue === "function" ? (
                    props.centerValue({
                      value: context().value,
                      valueAsDegree: context().valueAsDegree,
                    })
                  ) : (
                    props.centerValue
                  )}
                </div>
              )}
            </ArkAngleSlider.Context>
          )}
          <ArkAngleSlider.HiddenInput />
        </div>
      </div>
    </ArkAngleSlider.Root>
  );
};

export const meta: ComponentMeta<AngleSliderProps> = {
  name: "AngleSlider",
  description:
    "An angle slider component for selecting angular values (0-360 degrees). Built on Ark UI AngleSlider - all Ark UI AngleSlider props are supported.",
  examples: [
    {
      title: "Basic",
      description:
        "A simple angle slider with the value displayed in the center",
      code: () => {
        return (
          <AngleSlider
            id="angle-slider-basic"
            label="Wind Direction"
            defaultValue={21}
            centerValue
          />
        );
      },
    },
    {
      title: "Custom Step with Markers",
      description:
        "An angle slider with 45-degree step increments and aligned markers, with wrapping disabled",
      code: () => {
        return (
          <AngleSlider
            id="angle-slider-step"
            label="Rotation"
            defaultValue={90}
            step={45}
            markers={[0, 45, 90, 135, 180, 225, 270, 315]}
            centerValue
          />
        );
      },
    },
    {
      title: "Disabled",
      description: "A disabled angle slider with reduced opacity",
      code: () => {
        return (
          <AngleSlider
            id="angle-slider-disabled"
            label="Disabled"
            defaultValue={135}
            showMarkers
            disabled
            centerValue
          />
        );
      },
    },
    {
      title: "Custom Size",
      description: "An angle slider with custom size dimensions",
      code: () => {
        return (
          <div class="flex flex-col gap-4">
            <AngleSlider
              id="angle-slider-size-large"
              label="Large Slider (300px)"
              defaultValue={270}
              showMarkers
              centerValue
              size={300}
              thickness={24}
            />
            <AngleSlider
              id="angle-slider-size-small"
              label="Small Slider (150px)"
              defaultValue={45}
              showMarkers
              centerValue
              size={150}
              thickness={12}
            />
          </div>
        );
      },
    },
  ],
};

export default AngleSlider;
