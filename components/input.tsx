/**
 * Input Component - Multi-variant input with support for text, password, tags, textarea, and combobox
 *
 * Fixed: Controlled input handling (value prop)
 * - 'value', 'defaultValue', and 'onValueChange' are now only extracted for tags variant
 * - For all other input types, these props pass through {...others} to Field.Input
 * - This allows proper controlled component behavior with value={signal()}
 */

import { Field } from "@ark-ui/solid";
import { TagsInput as ArkTagsInput } from "@ark-ui/solid/tags-input";
import {
  Combobox as ArkCombobox,
  useListCollection,
} from "@ark-ui/solid/combobox";
import { useFilter } from "@ark-ui/solid/locale";
import { type JSX, splitProps, createSignal, Index, Show, For } from "solid-js";
import { Portal } from "solid-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out hover:border-ring/50 focus-visible:border-ring",
  {
    variants: {
      variant: {
        default: "",
        password: "pr-10",
        tags: "h-auto min-h-10 flex flex-wrap items-center gap-1.5 p-1.5 focus-visible:ring-0",
        textarea: "min-h-20 resize-none",
        combobox: "",
      },
      size: {
        default: "h-10 text-sm",
        sm: "h-9 text-xs",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const tagVariants = cva(
  "inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      size: {
        default: "text-xs h-6",
        sm: "text-[10px] h-5 px-1.5",
        lg: "text-xs h-7 px-2.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

// Input component with variants
type InputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement> &
    JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "type"
> &
  VariantProps<typeof inputVariants> & {
    type?:
      | "text"
      | "email"
      | "password"
      | "tags"
      | "textarea"
      | "number"
      | "tel"
      | "url"
      | "search"
      | "combobox";
    class?: string;
    // Combobox-specific props
    options?: Array<string | { label: string; value: string }>;
    onSelect?: (details: { value: string[] }) => void;
    clearable?: boolean;
    // Field-related props
    id?: string;
    name?: string;
    form?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    // Password-specific props
    autoComplete?: "current-password" | "new-password";
    defaultVisible?: boolean;
    visible?: boolean;
    onVisibilityChange?: (details: { visible: boolean }) => void;
    ignorePasswordManagers?: boolean;
    // Textarea-specific props
    autoresize?: boolean;
    // Tags-specific props
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (details: { value: string[] }) => void;
    max?: number;
    maxLength?: number;
    addOnPaste?: boolean;
    blurBehavior?: "add" | "clear";
    delimiter?: string | RegExp;
    editable?: boolean;
    allowOverflow?: boolean;
    validate?: (details: { value: string[]; inputValue: string }) => boolean;
  };

export const Input = (props: InputProps) => {
  // Determine if this is a tags variant to conditionally extract value props
  const isTagsVariant = props.type === "tags" || props.variant === "tags";

  // Split props - only extract value/defaultValue/onValueChange for tags variant
  const [local, others] = splitProps(props, [
    "class",
    "size",
    "variant",
    "type",
    "id",
    "name",
    "form",
    "disabled",
    "readOnly",
    "required",
    "invalid",
    "autoComplete",
    "defaultVisible",
    "visible",
    "onVisibilityChange",
    "ignorePasswordManagers",
    "autoresize",
    // Only extract these for tags variant - otherwise let them pass through
    ...(isTagsVariant
      ? (["value", "defaultValue", "onValueChange"] as const)
      : []),
    "max",
    "maxLength",
    "addOnPaste",
    "blurBehavior",
    "delimiter",
    "editable",
    "allowOverflow",
    "validate",
    "options",
    "onSelect",
    "clearable",
  ] as const);

  const [showPassword, setShowPassword] = createSignal(
    local.defaultVisible ?? false,
  );

  // Handle controlled visibility
  const isPasswordVisible = () => local.visible ?? showPassword();

  const togglePasswordVisibility = () => {
    const newValue = !isPasswordVisible();
    setShowPassword(newValue);
    local.onVisibilityChange?.({ visible: newValue });
  };

  // Determine variant based on type
  const effectiveVariant = () => {
    if (local.variant) return local.variant;
    if (local.type === "password") return "password";
    if (local.type === "tags") return "tags";
    if (local.type === "textarea") return "textarea";
    if (local.type === "combobox") return "combobox";
    return "default";
  };

  // Password variant
  const isPassword = () => effectiveVariant() === "password";

  // Tags variant
  const isTags = () => effectiveVariant() === "tags";

  // Textarea variant
  const isTextarea = () => effectiveVariant() === "textarea";

  // Combobox variant
  const isCombobox = () => effectiveVariant() === "combobox";

  return (
    <Show
      when={!isTags() && !isTextarea() && !isCombobox()}
      fallback={
        <Show
          when={isCombobox()}
          fallback={
            <Show
              when={isTags()}
              fallback={
                <Field.Textarea
                  autoresize={local.autoresize}
                  class={cn(
                    inputVariants({
                      variant: effectiveVariant(),
                      size: local.size,
                    }),
                    local.class,
                  )}
                  {...(others as any)}
                />
              }
            >
              <ArkTagsInput.Root
                value={local.value}
                defaultValue={local.defaultValue}
                onValueChange={local.onValueChange}
                max={local.max}
                maxLength={local.maxLength}
                addOnPaste={local.addOnPaste}
                blurBehavior={local.blurBehavior}
                delimiter={local.delimiter}
                editable={local.editable}
                allowOverflow={local.allowOverflow}
                validate={local.validate}
                disabled={local.disabled}
                readOnly={local.readOnly}
                invalid={local.invalid}
                required={local.required}
                name={local.name}
                form={local.form}
                id={local.id}
              >
                <ArkTagsInput.Context>
                  {(api) => (
                    <>
                      <ArkTagsInput.Control
                        class={cn(
                          inputVariants({
                            variant: effectiveVariant(),
                            size: local.size,
                          }),
                          local.class,
                        )}
                      >
                        <Index each={api().value}>
                          {(value, index) => (
                            <ArkTagsInput.Item index={index} value={value()}>
                              <ArkTagsInput.ItemPreview
                                class={cn(
                                  tagVariants({ size: local.size }),
                                  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                                )}
                              >
                                <ArkTagsInput.ItemText class="select-none">
                                  {value()}
                                </ArkTagsInput.ItemText>
                                <ArkTagsInput.ItemDeleteTrigger class="inline-flex items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none">
                                  <div class={cn("h-2.5 w-2.5", icon("x"))} />
                                </ArkTagsInput.ItemDeleteTrigger>
                              </ArkTagsInput.ItemPreview>
                              <ArkTagsInput.ItemInput class="bg-transparent outline-none placeholder:text-muted-foreground" />
                            </ArkTagsInput.Item>
                          )}
                        </Index>
                        <ArkTagsInput.Input
                          class="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          {...(others as any)}
                        />
                      </ArkTagsInput.Control>
                      <ArkTagsInput.HiddenInput />
                    </>
                  )}
                </ArkTagsInput.Context>
              </ArkTagsInput.Root>
            </Show>
          }
        >
          {/* Combobox variant */}
          {(() => {
            const filterFn = useFilter({ sensitivity: "base" });
            const items = (local.options || []).map((opt) =>
              typeof opt === "string" ? opt : opt.label,
            );

            const { collection, filter } = useListCollection({
              initialItems: items,
              filter: filterFn().contains,
            });

            const handleInputChange = (details: any) => {
              filter(details.inputValue);
            };

            const handleValueChange = (details: any) => {
              local.onSelect?.(details);
            };

            return (
              <ArkCombobox.Root
                collection={collection()}
                onInputValueChange={handleInputChange}
                onValueChange={handleValueChange}
                disabled={local.disabled}
                readOnly={local.readOnly}
                invalid={local.invalid}
                required={local.required}
                name={local.name}
                form={local.form}
                id={local.id}
                positioning={{ sameWidth: true }}
              >
                <ArkCombobox.Context>
                  {(context) => (
                    <>
                      <ArkCombobox.Control class="relative">
                        <ArkCombobox.Input
                          class={cn(
                            inputVariants({
                              variant: effectiveVariant(),
                              size: local.size,
                            }),
                            local.clearable &&
                              (context().value.length > 0 ||
                                context().inputValue)
                              ? "pr-20"
                              : "pr-10",
                            local.class,
                          )}
                          {...others}
                        />
                        <Show
                          when={
                            local.clearable &&
                            (context().value.length > 0 || context().inputValue)
                          }
                        >
                          <ArkCombobox.ClearTrigger class="absolute right-10 top-0 h-full px-2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center disabled:opacity-50">
                            <div class={cn("h-3.5 w-3.5", icon("x"))} />
                          </ArkCombobox.ClearTrigger>
                        </Show>
                        <ArkCombobox.Trigger class="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center disabled:opacity-50">
                          <div class={cn("h-4 w-4", icon("chevron-down"))} />
                        </ArkCombobox.Trigger>
                      </ArkCombobox.Control>
                      <Portal>
                        <ArkCombobox.Positioner>
                          <Show when={context().open}>
                            <ArkCombobox.Content class="z-50 min-w-[var(--reference-width)] max-h-[300px] overflow-y-auto rounded-md border border-border bg-background p-1 shadow-md outline-none focus:outline-none focus-visible:outline-none">
                              <Show when={collection().items.length === 0}>
                                <div class="px-2 py-6 text-center text-sm text-muted-foreground">
                                  No results found
                                </div>
                              </Show>
                              <For each={collection().items}>
                                {(item) => (
                                  <ArkCombobox.Item
                                    item={item}
                                    class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                  >
                                    <ArkCombobox.ItemText>
                                      {item}
                                    </ArkCombobox.ItemText>
                                    <Show
                                      when={
                                        collection().stringifyItem(item) &&
                                        context().value.includes(
                                          collection().stringifyItem(item)!,
                                        )
                                      }
                                    >
                                      <ArkCombobox.ItemIndicator class="ml-auto inline-flex h-4 w-4 items-center justify-center shrink-0">
                                        <div
                                          class={cn("h-4 w-4", icon("check"))}
                                        />
                                      </ArkCombobox.ItemIndicator>
                                    </Show>
                                  </ArkCombobox.Item>
                                )}
                              </For>
                            </ArkCombobox.Content>
                          </Show>
                        </ArkCombobox.Positioner>
                      </Portal>
                    </>
                  )}
                </ArkCombobox.Context>
              </ArkCombobox.Root>
            );
          })()}
        </Show>
      }
    >
      <Show
        when={!isPassword()}
        fallback={
          <div class="relative">
            <Field.Input
              type={isPasswordVisible() ? "text" : "password"}
              autocomplete={local.autoComplete}
              id={local.id}
              name={local.name}
              form={local.form}
              disabled={local.disabled}
              readOnly={local.readOnly}
              required={local.required}
              data-1p-ignore={local.ignorePasswordManagers}
              data-lpignore={local.ignorePasswordManagers}
              data-form-type={
                local.ignorePasswordManagers ? "other" : undefined
              }
              class={cn(
                inputVariants({
                  variant: effectiveVariant(),
                  size: local.size,
                }),
                local.class,
              )}
              {...others}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={local.disabled}
              class="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPasswordVisible() ? (
                <div class={cn("h-4 w-4", icon("eye-off"))} />
              ) : (
                <div class={cn("h-4 w-4", icon("eye"))} />
              )}
            </button>
          </div>
        }
      >
        <Field.Input
          type={local.type as any}
          id={local.id}
          name={local.name}
          form={local.form}
          disabled={local.disabled}
          readOnly={local.readOnly}
          required={local.required}
          class={cn(
            inputVariants({ variant: effectiveVariant(), size: local.size }),
            local.class,
          )}
          {...others}
        />
      </Show>
    </Show>
  );
};

export const meta: ComponentMeta<InputProps> = {
  name: "Input",
  description:
    "Form input component built with Ark UI Field. Supports type variants: text, email, password (with toggle), textarea (with autoresize), and tags (multi-value input). Use with Field.Root for labels, helper text, and error states when needed.",
  apiReference: "https://ark-ui.com/docs/components/field#api-reference",
  variants: inputVariants,
  examples: [
    {
      title: "Basic Input",
      description: "Standalone input with optional label",
      code: () => (
        <div class="space-y-2">
          <label class="text-sm font-medium">Email</label>
          <Input type="email" placeholder="Enter your email" />
        </div>
      ),
    },
    {
      title: "Password Input",
      description: "Password input with show/hide toggle",
      code: () => <Input type="password" placeholder="Enter password" />,
    },
    {
      title: "Textarea",
      description: "Multi-line text input with autoresize",
      code: () => (
        <Input type="textarea" autoresize placeholder="Enter your message..." />
      ),
    },
    {
      title: "Tags Input",
      description: "Input for adding multiple tags",
      code: () => (
        <Input
          type="tags"
          defaultValue={["React", "Solid", "Vue"]}
          placeholder="Add skill..."
        />
      ),
    },
    {
      title: "Combobox Input",
      description: "Searchable dropdown input with optional clear button",
      code: () => (
        <Input
          type="combobox"
          options={["React", "Solid", "Vue", "Svelte", "Angular"]}
          placeholder="Select a framework..."
        />
      ),
    },
  ],
};

export default Input;
