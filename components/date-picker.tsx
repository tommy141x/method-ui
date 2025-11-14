import { DatePicker as ArkDatePicker } from "@ark-ui/solid/date-picker";
import { type JSX, Index, Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

const datePickerTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "icon",
    },
  },
);

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out hover:border-ring/50 focus-visible:border-ring",
  {
    variants: {
      size: {
        default: "h-10 text-sm",
        sm: "h-9 text-xs",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface DatePickerProps extends VariantProps<typeof inputVariants> {
  children?: JSX.Element;
  value?: any[];
  defaultValue?: any[];
  onValueChange?: (details: { value: any[] }) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  class?: string;
  locale?: string;
  selectionMode?: "single" | "multiple" | "range";
  closeOnSelect?: boolean;
  numOfMonths?: number;
  min?: any;
  max?: any;
  positioning?: any;
  format?: (date: any, details: any) => string;
}

export const DatePicker = (props: DatePickerProps) => {
  return (
    <ArkDatePicker.Root
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
      readOnly={props.readOnly}
      name={props.name}
      locale={props.locale}
      selectionMode={props.selectionMode}
      closeOnSelect={props.closeOnSelect}
      numOfMonths={props.numOfMonths}
      min={props.min}
      max={props.max}
      positioning={props.positioning || { fitViewport: true }}
      format={props.format}
    >
      <ArkDatePicker.Control class="relative flex gap-2 items-center">
        <Show
          when={props.selectionMode === "range"}
          fallback={
            <>
              <ArkDatePicker.Input
                class={cn(
                  inputVariants({ size: props.size }),
                  "pr-10",
                  props.class,
                )}
                placeholder={props.placeholder}
              />
              <ArkDatePicker.Trigger
                class={cn(
                  datePickerTriggerVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                  "absolute right-1 top-1/2 -translate-y-1/2",
                )}
              >
                <div class={cn("h-4 w-4", icon("calendar"))} />
              </ArkDatePicker.Trigger>
            </>
          }
        >
          <ArkDatePicker.Input
            index={0}
            class={cn(inputVariants({ size: props.size }), props.class)}
            placeholder="Start date"
          />
          <ArkDatePicker.Input
            index={1}
            class={cn(inputVariants({ size: props.size }), props.class)}
            placeholder="End date"
          />
          <ArkDatePicker.Trigger
            class={cn(
              datePickerTriggerVariants({
                variant: "ghost",
                size: "icon",
              }),
              "shrink-0",
            )}
          >
            <div class={cn("h-4 w-4", icon("calendar"))} />
          </ArkDatePicker.Trigger>
        </Show>
      </ArkDatePicker.Control>

      <Portal>
        <ArkDatePicker.Positioner>
          <ArkDatePicker.Content class="z-50 min-w-[280px] rounded-md border border-border bg-background p-3 shadow-md outline-none focus:outline-none focus-visible:outline-none">
            <ArkDatePicker.View view="day">
              <ArkDatePicker.Context>
                {(context) => (
                  <>
                    <div class="flex items-center justify-center mb-4">
                      <ArkDatePicker.ViewControl class="flex items-center gap-2">
                        <ArkDatePicker.PrevTrigger
                          class={cn(
                            datePickerTriggerVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                          )}
                        >
                          <div class={cn("h-4 w-4", icon("chevron-left"))} />
                        </ArkDatePicker.PrevTrigger>

                        <ArkDatePicker.ViewTrigger
                          class={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
                          )}
                        >
                          <ArkDatePicker.RangeText />
                        </ArkDatePicker.ViewTrigger>

                        <ArkDatePicker.NextTrigger
                          class={cn(
                            datePickerTriggerVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                          )}
                        >
                          <div class={cn("h-4 w-4", icon("chevron-right"))} />
                        </ArkDatePicker.NextTrigger>
                      </ArkDatePicker.ViewControl>
                    </div>

                    <ArkDatePicker.Table class="border-collapse table-fixed">
                      <ArkDatePicker.TableHead>
                        <ArkDatePicker.TableRow class="flex">
                          <Index each={context().weekDays}>
                            {(weekDay) => (
                              <ArkDatePicker.TableHeader class="flex-1 text-xs font-medium text-muted-foreground p-2 text-center">
                                {weekDay().short}
                              </ArkDatePicker.TableHeader>
                            )}
                          </Index>
                        </ArkDatePicker.TableRow>
                      </ArkDatePicker.TableHead>

                      <ArkDatePicker.TableBody>
                        <Index each={context().weeks}>
                          {(week) => (
                            <ArkDatePicker.TableRow class="flex gap-1 mt-1 flex-nowrap">
                              <Index each={week()}>
                                {(day) => (
                                  <ArkDatePicker.TableCell
                                    value={day()}
                                    class="flex-1 p-0"
                                  >
                                    <ArkDatePicker.TableCellTrigger class="flex items-center justify-center h-9 w-9 text-sm rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[today]:border data-[today]:border-primary data-[outside-range]:text-muted-foreground data-[outside-range]:opacity-50 data-[in-range]:bg-accent data-[range-start]:rounded-r-none data-[range-end]:rounded-l-none transition-colors">
                                      {day().day}
                                    </ArkDatePicker.TableCellTrigger>
                                  </ArkDatePicker.TableCell>
                                )}
                              </Index>
                            </ArkDatePicker.TableRow>
                          )}
                        </Index>
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>

            <ArkDatePicker.View view="month">
              <ArkDatePicker.Context>
                {(context) => (
                  <>
                    <div class="flex items-center justify-center mb-4">
                      <ArkDatePicker.ViewControl class="flex items-center gap-2">
                        <ArkDatePicker.PrevTrigger
                          class={cn(
                            datePickerTriggerVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                          )}
                        >
                          <div class={cn("h-4 w-4", icon("chevron-left"))} />
                        </ArkDatePicker.PrevTrigger>

                        <ArkDatePicker.ViewTrigger
                          class={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
                          )}
                        >
                          <ArkDatePicker.RangeText />
                        </ArkDatePicker.ViewTrigger>

                        <ArkDatePicker.NextTrigger
                          class={cn(
                            datePickerTriggerVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                          )}
                        >
                          <div class={cn("h-4 w-4", icon("chevron-right"))} />
                        </ArkDatePicker.NextTrigger>
                      </ArkDatePicker.ViewControl>
                    </div>

                    <ArkDatePicker.Table class="table-fixed">
                      <ArkDatePicker.TableBody>
                        <Index
                          each={context().getMonthsGrid({
                            columns: 4,
                            format: "short",
                          })}
                        >
                          {(months) => (
                            <ArkDatePicker.TableRow class="flex gap-2 mt-2">
                              <Index each={months()}>
                                {(month) => (
                                  <ArkDatePicker.TableCell
                                    value={month().value}
                                    class="flex-1"
                                  >
                                    <ArkDatePicker.TableCellTrigger class="h-10 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground transition-colors">
                                      {month().label}
                                    </ArkDatePicker.TableCellTrigger>
                                  </ArkDatePicker.TableCell>
                                )}
                              </Index>
                            </ArkDatePicker.TableRow>
                          )}
                        </Index>
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>

            <ArkDatePicker.View view="year">
              <ArkDatePicker.Context>
                {(context) => (
                  <>
                    <div class="flex items-center justify-center mb-4">
                      <ArkDatePicker.ViewControl class="flex items-center gap-2">
                        <ArkDatePicker.PrevTrigger
                          class={cn(
                            datePickerTriggerVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                          )}
                        >
                          <div class={cn("h-4 w-4", icon("chevron-left"))} />
                        </ArkDatePicker.PrevTrigger>

                        <ArkDatePicker.ViewTrigger
                          class={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2",
                          )}
                        >
                          <ArkDatePicker.RangeText />
                        </ArkDatePicker.ViewTrigger>

                        <ArkDatePicker.NextTrigger
                          class={cn(
                            datePickerTriggerVariants({
                              variant: "ghost",
                              size: "icon",
                            }),
                          )}
                        >
                          <div class={cn("h-4 w-4", icon("chevron-right"))} />
                        </ArkDatePicker.NextTrigger>
                      </ArkDatePicker.ViewControl>
                    </div>

                    <ArkDatePicker.Table class="table-fixed">
                      <ArkDatePicker.TableBody>
                        <Index each={context().getYearsGrid({ columns: 4 })}>
                          {(years) => (
                            <ArkDatePicker.TableRow class="flex gap-2 mt-2">
                              <Index each={years()}>
                                {(year) => (
                                  <ArkDatePicker.TableCell
                                    value={year().value}
                                    class="flex-1"
                                  >
                                    <ArkDatePicker.TableCellTrigger class="h-10 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground transition-colors">
                                      {year().label}
                                    </ArkDatePicker.TableCellTrigger>
                                  </ArkDatePicker.TableCell>
                                )}
                              </Index>
                            </ArkDatePicker.TableRow>
                          )}
                        </Index>
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>
    </ArkDatePicker.Root>
  );
};

export const meta: ComponentMeta<DatePickerProps> = {
  name: "DatePicker",
  description:
    "Date picker component built with Ark UI. Supports single date selection, range selection, and multiple date selection with a clean calendar interface.",
  variants: inputVariants,
  examples: [
    {
      title: "Basic Date Picker",
      description: "Simple date picker for single date selection",
      code: () => <DatePicker placeholder="Select a date" />,
    },
    {
      title: "Date Range Picker",
      description: "Pick a date range with start and end dates",
      code: () => <DatePicker selectionMode="range" />,
    },
  ],
};

export default DatePicker;
