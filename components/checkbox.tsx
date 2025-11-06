import { Checkbox as ArkCheckbox } from "@ark-ui/solid";
import { type JSX, splitProps, Show, For } from "solid-js";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

// Simple Checkbox component - the easy way
interface CheckboxProps {
  children?: JSX.Element;
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean | "indeterminate";
  onCheckedChange?: (details: { checked: boolean | "indeterminate" }) => void;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  class?: string;
}

export const Checkbox = (props: CheckboxProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <ArkCheckbox.Root
      class={cn("flex items-center gap-2", local.class)}
      {...others}
    >
      <ArkCheckbox.Control class="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all duration-200 ease-out hover:border-ring hover:shadow-sm">
        <ArkCheckbox.Indicator class="flex items-center justify-center w-full h-full transition-all duration-200 ease-out data-[state=checked]:animate-in data-[state=checked]:fade-in data-[state=checked]:zoom-in-50 [&[hidden]]:hidden">
          <div class={cn("h-3 w-3", icon("check"))} />
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      <Show when={local.children}>
        <ArkCheckbox.Label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-150 cursor-pointer select-none">
          {local.children}
        </ArkCheckbox.Label>
      </Show>
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
};

// Composable API for advanced usage
export const CheckboxRoot = ArkCheckbox.Root;
export const CheckboxLabel = (props: {
  children?: JSX.Element;
  class?: string;
}) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <ArkCheckbox.Label
      class={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-150 cursor-pointer select-none",
        local.class,
      )}
      {...others}
    />
  );
};

export const CheckboxControl = (props: {
  children?: JSX.Element;
  class?: string;
}) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <ArkCheckbox.Control
      class={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all duration-200 ease-out hover:border-ring hover:shadow-sm",
        local.class,
      )}
      {...others}
    />
  );
};

export const CheckboxIndicator = (props: {
  indeterminate?: boolean;
  children?: JSX.Element;
  class?: string;
}) => {
  const [local, others] = splitProps(props, [
    "class",
    "children",
    "indeterminate",
  ]);
  return (
    <ArkCheckbox.Indicator
      indeterminate={local.indeterminate}
      class={cn(
        "flex items-center justify-center w-full h-full transition-all duration-200 ease-out data-[state=checked]:animate-in data-[state=checked]:fade-in data-[state=checked]:zoom-in-50 data-[state=indeterminate]:animate-in data-[state=indeterminate]:fade-in data-[state=indeterminate]:zoom-in-50 [&[hidden]]:hidden",
        local.class,
      )}
      {...others}
    >
      {local.children || (
        <div
          class={cn("h-3 w-3", icon(local.indeterminate ? "minus" : "check"))}
        />
      )}
    </ArkCheckbox.Indicator>
  );
};

export const CheckboxHiddenInput = ArkCheckbox.HiddenInput;

// CheckboxGroup for multiple checkboxes
interface CheckboxGroupProps {
  children?: JSX.Element;
  class?: string;
}

export const CheckboxGroup = (
  props: CheckboxGroupProps & Omit<ArkCheckbox.GroupProps, "class">,
) => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <ArkCheckbox.Group
      class={cn("flex flex-col gap-2", local.class)}
      {...others}
    />
  );
};

export const meta: ComponentMeta<CheckboxProps> = {
  name: "Checkbox",
  description:
    "A checkbox component that allows users to select one or more items from a set. Use Checkbox for simple cases, or compose with CheckboxRoot, CheckboxControl, CheckboxIndicator, and CheckboxLabel for full control.",
  examples: [
    {
      title: "Basic Checkbox",
      description: "A simple checkbox with label",
      code: () => <Checkbox>Accept terms and conditions</Checkbox>,
    },

    {
      title: "Checkbox Group",
      description: "Multiple checkboxes in a group",
      code: () => {
        const items = [
          { label: "React", value: "react" },
          { label: "Solid", value: "solid" },
          { label: "Vue", value: "vue" },
        ];

        return (
          <CheckboxGroup defaultValue={["solid"]} name="framework">
            <For each={items}>
              {(item) => <Checkbox value={item.value}>{item.label}</Checkbox>}
            </For>
          </CheckboxGroup>
        );
      },
    },
  ],
};

export default Checkbox;
