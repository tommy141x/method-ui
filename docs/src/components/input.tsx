import { Field } from "@ark-ui/solid";
import { TagsInput as ArkTagsInput } from "@ark-ui/solid/tags-input";
import { cva, type VariantProps } from "class-variance-authority";
import type { ClassValue } from "clsx";
import clsx from "clsx";
import { createSignal, Index, type JSX, Show, splitProps } from "solid-js";
import { unoMerge } from "unocss-merge";

// Hardcoded cn function - makes this component completely self-contained
function cn(...classLists: ClassValue[]) {
	return unoMerge(clsx(classLists));
}

// Icon helper function - returns UnoCSS icon class for your configured icon library
function icon(name: string): string {
	return `i-lucide-${name}`;
}

const inputVariants = cva(
	"flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-out hover:border-ring/50 focus-visible:border-ring",
	{
		variants: {
			variant: {
				default: "",
				password: "pr-10",
				tags: "h-auto min-h-10 flex flex-wrap items-center gap-1.5 p-1.5 focus-visible:ring-0",
				textarea: "min-h-20 resize-none",
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
	}
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
	}
);

// Input component with variants
type InputProps = Omit<
	JSX.InputHTMLAttributes<HTMLInputElement> & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
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
			| "search";
		class?: string;
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
		"value",
		"defaultValue",
		"onValueChange",
		"max",
		"maxLength",
		"addOnPaste",
		"blurBehavior",
		"delimiter",
		"editable",
		"allowOverflow",
		"validate",
	]);

	const [showPassword, setShowPassword] = createSignal(local.defaultVisible ?? false);

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
		return "default";
	};

	// Password variant
	const isPassword = () => effectiveVariant() === "password";

	// Tags variant
	const isTags = () => effectiveVariant() === "tags";

	// Textarea variant
	const isTextarea = () => effectiveVariant() === "textarea";

	return (
		<Show
			when={!isTags() && !isTextarea()}
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
								local.class
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
											local.class
										)}
									>
										<Index each={api().value}>
											{(value, index) => (
												<ArkTagsInput.Item index={index} value={value()}>
													<ArkTagsInput.ItemPreview
														class={cn(
															tagVariants({ size: local.size }),
															"data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
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
							data-form-type={local.ignorePasswordManagers ? "other" : undefined}
							class={cn(
								inputVariants({
									variant: effectiveVariant(),
									size: local.size,
								}),
								local.class
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
					class={cn(inputVariants({ variant: effectiveVariant(), size: local.size }), local.class)}
					{...others}
				/>
			</Show>
		</Show>
	);
};

export default Input;
