import { DatePicker as ArkDatePicker } from "@ark-ui/solid/date-picker";
import type { DateValue } from "@internationalized/date";
import type { LocaleDetails } from "@zag-js/date-picker";
import { cva, type VariantProps } from "class-variance-authority";
import { children, Index, type JSX, mergeProps, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import IconCalendar from "~icons/lucide/calendar";
import IconChevronLeft from "~icons/lucide/chevron-left";
import IconChevronRight from "~icons/lucide/chevron-right";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";
import { buttonVariants } from "./button";

// ─── Variants ─────────────────────────────────────────────────────────────────

const datePickerInputVariants = cva(
	"flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out hover:border-ring/50 focus-visible:border-ring",
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
	}
);

// Pre-composed class for day-grid cell triggers — extracted here so it isn't
// inlined as a 300-char string inside JSX.
const cellTriggerClass = cn(
	buttonVariants({ variant: "ghost" }),
	"size-8 w-full p-0 font-normal",
	"data-today:bg-accent data-today:text-accent-foreground",
	"[&:is([data-today][data-selected])]:bg-primary [&:is([data-today][data-selected])]:text-primary-foreground",
	"data-selected:bg-primary data-selected:text-primary-foreground",
	"data-selected:hover:bg-primary data-selected:hover:text-primary-foreground",
	"data-disabled:text-muted-foreground data-disabled:opacity-50",
	"data-outside-range:text-muted-foreground data-outside-range:opacity-50",
	"[&:is([data-outside-range][data-in-range])]:opacity-30",
	"data-range-start:rounded-r-none data-range-end:rounded-l-none"
);

// ─── Direct primitive re-exports ──────────────────────────────────────────────

export const DatePickerContext = ArkDatePicker.Context;
export const DatePickerLabel = ArkDatePicker.Label;
export const DatePickerTableHead = ArkDatePicker.TableHead;
export const DatePickerTableBody = ArkDatePicker.TableBody;
export const DatePickerYearSelect = ArkDatePicker.YearSelect;
export const DatePickerMonthSelect = ArkDatePicker.MonthSelect;
export const DatePickerPositioner = ArkDatePicker.Positioner;

// ─── Wrapped sub-components ───────────────────────────────────────────────────

export const DatePickerControl = (props: ArkDatePicker.ControlProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkDatePicker.Control class={cn("flex items-center gap-2", local.class)} {...others} />;
};

type DatePickerInputProps = ArkDatePicker.InputProps & VariantProps<typeof datePickerInputVariants>;

export const DatePickerInput = (props: DatePickerInputProps) => {
	const [local, others] = splitProps(props, ["class", "size"]);
	return (
		<ArkDatePicker.Input
			class={cn(datePickerInputVariants({ size: local.size }), local.class)}
			{...others}
		/>
	);
};

export const DatePickerTrigger = (props: ArkDatePicker.TriggerProps) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	// Resolve children once to avoid double-invocation of the children accessor.
	const resolved = children(() => local.children);
	const hasChildren = () => resolved.toArray().length > 0;
	return (
		<ArkDatePicker.Trigger
			class={cn(buttonVariants({ variant: "ghost", size: "icon" }), local.class)}
			{...others}
		>
			<Show when={hasChildren()} fallback={<IconCalendar class="size-4" />}>
				{resolved()}
			</Show>
		</ArkDatePicker.Trigger>
	);
};

export const DatePickerContent = (props: ArkDatePicker.ContentProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkDatePicker.Content
			class={cn(
				"z-50 min-w-[280px] rounded-md border border-border bg-background p-3 shadow-md outline-none",
				"data-[state=open]:animate-in data-[state=closed]:animate-out",
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				local.class
			)}
			{...others}
		/>
	);
};

export const DatePickerView = (props: ArkDatePicker.ViewProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkDatePicker.View class={cn("space-y-3", local.class)} {...others} />;
};

export const DatePickerViewControl = (props: ArkDatePicker.ViewControlProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkDatePicker.ViewControl
			class={cn("flex items-center justify-between gap-2", local.class)}
			{...others}
		/>
	);
};

export const DatePickerPrevTrigger = (props: ArkDatePicker.PrevTriggerProps) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	const resolved = children(() => local.children);
	const hasChildren = () => resolved.toArray().length > 0;
	return (
		<ArkDatePicker.PrevTrigger
			class={cn(buttonVariants({ variant: "ghost", size: "icon" }), local.class)}
			{...others}
		>
			<Show when={hasChildren()} fallback={<IconChevronLeft class="size-4" />}>
				{resolved()}
			</Show>
		</ArkDatePicker.PrevTrigger>
	);
};

export const DatePickerNextTrigger = (props: ArkDatePicker.NextTriggerProps) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	const resolved = children(() => local.children);
	const hasChildren = () => resolved.toArray().length > 0;
	return (
		<ArkDatePicker.NextTrigger
			class={cn(buttonVariants({ variant: "ghost", size: "icon" }), local.class)}
			{...others}
		>
			<Show when={hasChildren()} fallback={<IconChevronRight class="size-4" />}>
				{resolved()}
			</Show>
		</ArkDatePicker.NextTrigger>
	);
};

export const DatePickerViewTrigger = (props: ArkDatePicker.ViewTriggerProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkDatePicker.ViewTrigger
			class={cn(buttonVariants({ variant: "ghost" }), "h-7 font-semibold", local.class)}
			{...others}
		/>
	);
};

export const DatePickerRangeText = (props: ArkDatePicker.RangeTextProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkDatePicker.RangeText class={cn("text-sm font-medium", local.class)} {...others} />;
};

export const DatePickerTable = (props: ArkDatePicker.TableProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkDatePicker.Table class={cn("w-full border-collapse", local.class)} {...others} />;
};

export const DatePickerTableRow = (props: ArkDatePicker.TableRowProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkDatePicker.TableRow class={cn("flex", local.class)} {...others} />;
};

export const DatePickerTableHeader = (props: ArkDatePicker.TableHeaderProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkDatePicker.TableHeader
			class={cn("flex-1 p-2 text-center text-xs font-medium text-muted-foreground", local.class)}
			{...others}
		/>
	);
};

export const DatePickerTableCell = (props: ArkDatePicker.TableCellProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return (
		<ArkDatePicker.TableCell
			class={cn(
				"flex-1 p-0 text-center text-sm",
				"has-data-in-range:bg-accent",
				"has-data-range-start:rounded-l-md has-data-range-end:rounded-r-md",
				"has-[[data-outside-range][data-in-range]]:bg-accent/50",
				local.class
			)}
			{...others}
		/>
	);
};

export const DatePickerTableCellTrigger = (props: ArkDatePicker.TableCellTriggerProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <ArkDatePicker.TableCellTrigger class={cn(cellTriggerClass, local.class)} {...others} />;
};

// ─── Internal: shared view header used by the assembled DatePicker ─────────────
// Renders the prev/range-text/next navigation row that is identical across the
// day, month, and year views.  Not exported — consumers can compose their own
// header from the exported primitives above.

const DatePickerViewHeader = () => (
	<DatePickerViewControl>
		<DatePickerPrevTrigger />
		<DatePickerViewTrigger>
			<DatePickerRangeText />
		</DatePickerViewTrigger>
		<DatePickerNextTrigger />
	</DatePickerViewControl>
);

// ─── Assembled convenience component ─────────────────────────────────────────

interface DatePickerProps extends VariantProps<typeof datePickerInputVariants> {
	children?: JSX.Element;
	value?: DateValue[];
	defaultValue?: DateValue[];
	onValueChange?: (details: { value: DateValue[] }) => void;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	name?: string;
	class?: string;
	locale?: string;
	selectionMode?: "single" | "multiple" | "range";
	closeOnSelect?: boolean;
	numOfMonths?: number;
	min?: DateValue;
	max?: DateValue;
	positioning?: Record<string, unknown>;
	format?: (date: DateValue, details: LocaleDetails) => string;
}

export const DatePicker = (props: DatePickerProps) => {
	// Apply defaults before splitting so rootProps already carries them.
	const merged = mergeProps(
		{ positioning: { fitViewport: true } as Record<string, unknown> },
		props
	);

	// Split display/styling props away from everything that belongs on Root.
	const [local, rootProps] = splitProps(merged, ["size", "class", "placeholder"]);

	const isRange = () => rootProps.selectionMode === "range";

	return (
		<ArkDatePicker.Root {...rootProps}>
			{/* ── Control (input row) ── */}
			<DatePickerControl class={cn(!isRange() && "relative")}>
				<Show
					when={isRange()}
					fallback={
						<>
							<DatePickerInput
								size={local.size ?? undefined}
								class={cn("pr-10", local.class)}
								placeholder={local.placeholder}
							/>
							<DatePickerTrigger class="absolute right-1 top-1/2 -translate-y-1/2" />
						</>
					}
				>
					<DatePickerInput
						index={0}
						size={local.size ?? undefined}
						class={local.class}
						placeholder="Start date"
					/>
					<DatePickerInput
						index={1}
						size={local.size ?? undefined}
						class={local.class}
						placeholder="End date"
					/>
					<DatePickerTrigger class="shrink-0" />
				</Show>
			</DatePickerControl>

			{/* ── Popover ── */}
			<Portal>
				<DatePickerPositioner>
					<DatePickerContent>
						{/* Day view */}
						<DatePickerView view="day">
							<ArkDatePicker.Context>
								{(context) => (
									<>
										<DatePickerViewHeader />
										<DatePickerTable>
											<DatePickerTableHead>
												<DatePickerTableRow>
													<Index each={context().weekDays}>
														{(weekDay) => (
															<DatePickerTableHeader>{weekDay().short}</DatePickerTableHeader>
														)}
													</Index>
												</DatePickerTableRow>
											</DatePickerTableHead>
											<DatePickerTableBody>
												<Index each={context().weeks}>
													{(week) => (
														<DatePickerTableRow class="gap-1 mt-1 flex-nowrap">
															<Index each={week()}>
																{(day) => (
																	<DatePickerTableCell value={day()}>
																		<DatePickerTableCellTrigger>
																			{day().day}
																		</DatePickerTableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</ArkDatePicker.Context>
						</DatePickerView>

						{/* Month view */}
						<DatePickerView view="month">
							<ArkDatePicker.Context>
								{(context) => (
									<>
										<DatePickerViewHeader />
										<DatePickerTable class="table-fixed">
											<DatePickerTableBody>
												<Index
													each={context().getMonthsGrid({
														columns: 4,
														format: "short",
													})}
												>
													{(months) => (
														<DatePickerTableRow class="gap-2 mt-2">
															<Index each={months()}>
																{(month) => (
																	<DatePickerTableCell value={month().value} class="flex-1">
																		<ArkDatePicker.TableCellTrigger
																			class={cn(
																				buttonVariants({ variant: "ghost" }),
																				"h-10 w-full px-3 text-sm",
																				"data-selected:bg-primary data-selected:text-primary-foreground",
																				"data-selected:hover:bg-primary data-selected:hover:text-primary-foreground",
																				"data-disabled:opacity-50 data-disabled:pointer-events-none"
																			)}
																		>
																			{month().label}
																		</ArkDatePicker.TableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</ArkDatePicker.Context>
						</DatePickerView>

						{/* Year view */}
						<DatePickerView view="year">
							<ArkDatePicker.Context>
								{(context) => (
									<>
										<DatePickerViewHeader />
										<DatePickerTable class="table-fixed">
											<DatePickerTableBody>
												<Index each={context().getYearsGrid({ columns: 4 })}>
													{(years) => (
														<DatePickerTableRow class="gap-2 mt-2">
															<Index each={years()}>
																{(year) => (
																	<DatePickerTableCell value={year().value} class="flex-1">
																		<ArkDatePicker.TableCellTrigger
																			class={cn(
																				buttonVariants({ variant: "ghost" }),
																				"h-10 w-full px-3 text-sm",
																				"data-selected:bg-primary data-selected:text-primary-foreground",
																				"data-selected:hover:bg-primary data-selected:hover:text-primary-foreground",
																				"data-disabled:opacity-50 data-disabled:pointer-events-none"
																			)}
																		>
																			{year().label}
																		</ArkDatePicker.TableCellTrigger>
																	</DatePickerTableCell>
																)}
															</Index>
														</DatePickerTableRow>
													)}
												</Index>
											</DatePickerTableBody>
										</DatePickerTable>
									</>
								)}
							</ArkDatePicker.Context>
						</DatePickerView>
					</DatePickerContent>
				</DatePickerPositioner>
			</Portal>
		</ArkDatePicker.Root>
	);
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const meta: ComponentMeta<DatePickerProps> = {
	name: "DatePicker",
	description:
		"Date picker component built with Ark UI. Supports single date selection, range selection, and multiple date selection with a clean calendar interface.",
	variants: datePickerInputVariants,
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
