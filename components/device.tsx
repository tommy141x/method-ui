import { cva, type VariantProps } from "class-variance-authority";
import type { Component, JSX } from "solid-js";
import { createUniqueId, Show, splitProps } from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const deviceVariants = cva("", {
	variants: {
		variant: {
			macbook: "",
			imac: "",
			iphone: "",
			ipad: "",
		},
	},
	defaultVariants: {
		variant: "macbook",
	},
});

export interface DeviceProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	variant?: VariantProps<typeof deviceVariants>["variant"];
	src?: string;
	class?: string;
}

export const Device: Component<DeviceProps> = (props) => {
	const [local, others] = splitProps(props, ["variant", "src", "class"]);

	const variant = () => local.variant || "macbook";
	const clipId = createUniqueId();

	return (
		<Show
			when={variant() === "macbook"}
			fallback={
				<Show
					when={variant() === "imac"}
					fallback={
						<Show
							when={variant() === "iphone"}
							fallback={
								<Show when={variant() === "ipad"}>
									<svg
										width={520}
										height={400}
										viewBox="0 0 520 400"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										role="img"
										aria-label="iPad device mockup"
										class={cn(local.class)}
										{...others}
									>
										<defs>
											<clipPath id={clipId}>
												<rect
													fill="#ffffff"
													x="31.37"
													y="28.47"
													width="457.25"
													height="342.87"
													rx="9.61"
													ry="9.61"
												/>
											</clipPath>
										</defs>
										<path
											fill="#aaabac"
											d="M479.04,14.14H88.14v-.59c0-.16-.13-.3-.3-.3h-16.7c-.16,0-.3.13-.3.3v.59h-3.46v-.59c0-.16-.13-.3-.3-.3h-16.7c-.16,0-.3.13-.3.3v.59h-9.13c-13.4,0-24.27,10.78-24.45,24.14h-.48c-.16,0-.3.13-.3.3v20.07c0,.16.13.3.3.3h.47v303.38c0,13.51,10.95,24.45,24.45,24.45h438.08c13.51,0,24.45-10.95,24.45-24.45V38.6c0-13.51-10.95-24.45-24.45-24.45Z"
										/>
										<rect
											fill="#000"
											x="18.58"
											y="15.94"
											width="482.84"
											height="368.91"
											rx="23.29"
											ry="23.29"
										/>
										<rect
											fill="currentColor"
											x="31.37"
											y="28.47"
											width="457.25"
											height="342.87"
											rx="9.61"
											ry="9.61"
										/>
										<Show when={local.src}>
											<image
												href={local.src}
												x="31.37"
												y="28.47"
												width="457.25"
												height="342.87"
												preserveAspectRatio="xMidYMid slice"
												style={{ "clip-path": `url(#${clipId})` }}
											/>
										</Show>
										<circle fill="#0a1054" cx="245.1" cy="22.23" r="2.44" />
										<circle fill="#333" cx="274.98" cy="22.23" r=".88" />
									</svg>
								</Show>
							}
						>
							<svg
								width={200}
								height={400}
								viewBox="0 0 200 400"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								role="img"
								aria-label="iPhone device mockup"
								class={cn(local.class)}
								{...others}
							>
								<defs>
									<clipPath id={clipId}>
										<rect x="12.7" y="10.11" width="174.62" height="379.78" rx="26.97" ry="26.97" />
									</clipPath>
								</defs>
								<Show
									when={local.src}
									fallback={
										<rect
											fill="currentColor"
											x="12.7"
											y="10.11"
											width="174.62"
											height="379.78"
											rx="26.97"
											ry="26.97"
										/>
									}
								>
									<image
										href={local.src}
										x="12.7"
										y="10.11"
										width="174.62"
										height="379.78"
										preserveAspectRatio="xMidYMid slice"
										style={{ "clip-path": `url(#${clipId})` }}
									/>
								</Show>
								<path
									fill="#303333"
									d="M194.85,127.85c0-.25-.2-.45-.44-.45-.11.04-.37.03-.68,0V36.12c0-17.91-14.29-32.42-31.91-32.42H38.17C20.55,3.7,6.26,18.21,6.26,36.12v49.16c-.3.02-.55.03-.65-.02-.24,0-.44.2-.44.45,0,0,0,17.36,0,17.36-.03.41.5.49,1.09.48v13.68c-.6,0-1.13.08-1.09.49,0,0,0,28.64,0,28.64-.03.42.5.49,1.09.48v7.98c-.6,0-1.13.08-1.09.49,0,0,0,28.64,0,28.64-.03.42.5.49,1.09.48v179.5c0,17.91,14.29,32.42,31.91,32.42h123.65c17.62,0,31.91-14.52,31.91-32.42v-189.55c.31-.02.57-.03.68.04,1.25.1.03-46.11.44-46.55ZM187.32,363.23c0,13.61-13.25,26.65-26.64,26.65H39.32c-13.39,0-26.62-13.04-26.62-26.65V36.8c0-13.61,13.22-26.69,26.62-26.69h121.36c13.39,0,26.64,13.08,26.64,26.69v326.43Z"
								/>
								<path
									fill="#000000"
									d="M161.38,5.89H38.78c-16.54,0-29.95,13.5-29.95,30.15v327.79c0,16.65,13.41,30.15,29.95,30.15h122.6c16.54,0,29.95-13.5,29.95-30.15V36.05c0-16.65-13.41-30.15-29.95-30.15ZM187.32,363.65c0,13.69-12.28,26.24-25.87,26.24H38.7c-13.6,0-26-12.55-26-26.24V36.24c0-13.69,11.42-26.13,25.02-26.13h122.75c13.6,0,26.85,12.44,26.85,26.13v327.4Z"
								/>
								<path
									fill="#000000"
									d="M119.61,32.33h-38.93c-10.48-.18-10.5-15.78,0-15.96,0,0,38.93,0,38.93,0,4.41,0,7.98,3.57,7.98,7.98,0,4.41-3.57,7.98-7.98,7.98Z"
								/>
								<path
									fill="#080d4c"
									d="M118.78,27.68c-4.32.06-4.32-6.73,0-6.66,4.32-.06,4.32,6.73,0,6.66Z"
								/>
							</svg>
						</Show>
					}
				>
					<svg
						width={600}
						height={500}
						viewBox="0 0 600 500"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="iMac device mockup"
						class={cn(local.class)}
						{...others}
					>
						<defs>
							<clipPath id={clipId}>
								<rect
									fill="#ffffff"
									x="29.12"
									y="25.02"
									width="541.76"
									height="305.06"
									rx=".44"
									ry=".44"
								/>
							</clipPath>
							<linearGradient
								id="linear-gradient"
								x1="300"
								y1="484.69"
								x2="300"
								y2="401.32"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0" stop-color="#a7a9ac" />
								<stop offset=".1" stop-color="#d1d3d4" />
								<stop offset=".41" stop-color="#e6e7e8" />
								<stop offset=".73" stop-color="#e6e7e8" />
								<stop offset="1" stop-color="#d1d3d4" />
							</linearGradient>
						</defs>
						<rect fill="url(#linear-gradient)" x="232.4" y="401.32" width="135.19" height="83.37" />
						<rect
							fill="#dedfe2"
							x="234.32"
							y="489.39"
							width="17.21"
							height="1.9"
							rx=".15"
							ry=".15"
						/>
						<rect
							fill="#dedfe2"
							x="348.45"
							y="489.39"
							width="17.21"
							height="1.9"
							rx=".15"
							ry=".15"
						/>
						<rect fill="#dedfe1" x="232.4" y="484.69" width="135.19" height="5.61" />
						<path
							fill="#eeeeef"
							d="M23.83,10.99h552.03c4.92,0,8.91,3.99,8.91,8.91v324.18H14.92V19.9c0-4.92,3.99-8.91,8.91-8.91Z"
						/>
						<path
							fill="#d9d9db"
							d="M23.83,343.94h552.03c4.92,0,8.91,3.99,8.91,8.91v48.47H14.92v-48.47c0-4.92,3.99-8.91,8.91-8.91Z"
							transform="translate(599.69 745.26) rotate(180)"
						/>
						<path
							fill="#231f20"
							d="M570.43,330.43H29.57c-.44,0-.79-.36-.79-.79V25.47c0-.44.36-.79.79-.79h540.87c.44,0,.79.36.79.79v304.17c0,.44-.36.79-.79.79ZM29.57,25.37c-.05,0-.1.04-.1.09v304.17c0,.05.04.1.1.1h540.87c.05,0,.09-.04.09-.1V25.47c0-.05-.04-.09-.09-.09H29.57Z"
						/>
						<rect
							fill="#fff"
							x="29.12"
							y="25.02"
							width="541.76"
							height="305.06"
							rx=".44"
							ry=".44"
						/>
						<circle fill="#414042" cx="300" cy="17.7" r="2.11" />
						<circle fill="#262262" cx="300" cy="17.7" r=".85" />
						<rect
							fill="currentColor"
							x="29.12"
							y="25.02"
							width="541.76"
							height="305.06"
							rx=".44"
							ry=".44"
						/>
						<Show when={local.src}>
							<image
								href={local.src}
								x="29.12"
								y="25.02"
								width="543.76"
								height="305.06"
								preserveAspectRatio="xMidYMid slice"
								style={{ "clip-path": `url(#${clipId})` }}
							/>
						</Show>
					</svg>
				</Show>
			}
		>
			<svg
				width={650}
				height={400}
				viewBox="0 0 650 400"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
				aria-label="MacBook device mockup"
				class={cn(local.class)}
				{...others}
			>
				<defs>
					<clipPath id={clipId}>
						<rect fill="#ffffff" x="74.5" y="21.5" width="501" height="323" rx="5" ry="5" />
					</clipPath>
				</defs>
				<path
					fill="#a4a5a7"
					d="M79.56,13.18h491.32c7.23,0,13.1,5.87,13.1,13.1v336.61H66.46V26.28c0-7.23,5.87-13.1,13.1-13.1Z"
				/>
				<path
					fill="#222"
					d="M79.96,14.24h490.45c6.83,0,12.37,5.54,12.37,12.37v336.28H67.59V26.6c0-6.83,5.54-12.37,12.37-12.37Z"
				/>
				<path
					fill="#000"
					d="M570.25,15.74H80.34c-6.12,0-11.08,4.96-11.08,11.08v336.07h512.08V26.82c0-6.12-4.96-11.08-11.08-11.08ZM575.74,345.17H74.52V27.31c0-3.31,2.68-5.99,5.99-5.99h489.24c3.31,0,5.99,2.68,5.99,5.99v317.86Z"
				/>
				<rect fill="currentColor" x="74.5" y="21.5" width="501" height="323" rx="5" ry="5" />
				<Show when={local.src}>
					<image
						href={local.src}
						x="74.5"
						y="21.5"
						width="501"
						height="323"
						preserveAspectRatio="xMidYMid slice"
						style={{ "clip-path": `url(#${clipId})` }}
					/>
				</Show>
				<rect fill="#1d1d1d" x="69.09" y="350.51" width="512.11" height="12.48" />
				<path
					fill="#000"
					d="M298.14,21.02h54.07v6.5c0,1.56-1.27,2.82-2.82,2.82h-48.42c-1.56,0-2.82-1.27-2.82-2.82v-6.5h0Z"
				/>
				<path
					fill="#acadaf"
					d="M19.04,362.77h611.92v10.39c0,5.95-4.83,10.79-10.79,10.79H29.83c-5.95,0-10.79-4.83-10.79-10.79v-10.39h0Z"
				/>
				<path
					fill="#080d4c"
					d="M325.11,25.14c-1.99.03-1.99-3.09,0-3.06,1.99-.03,1.99,3.09,0,3.06Z"
				/>
				<polygon
					fill="#b9b9bb"
					points="600.06 385.39 567.29 385.39 565.84 383.95 601.82 383.95 600.06 385.39"
				/>
				<polygon
					fill="#292929"
					points="598.73 386.82 568.64 386.82 567.32 385.39 600.35 385.39 598.73 386.82"
				/>
				<polygon
					fill="#b9b9bb"
					points="82.64 385.39 49.87 385.39 48.43 383.95 84.41 383.95 82.64 385.39"
				/>
				<polygon
					fill="#292929"
					points="81.31 386.82 51.23 386.82 49.9 385.39 82.93 385.39 81.31 386.82"
				/>
				<path
					fill="#8f9091"
					d="M278.11,362.6h94.05c0,3.63-2.95,6.58-6.58,6.58h-80.89c-3.63,0-6.58-2.95-6.58-6.58h0Z"
				/>
			</svg>
		</Show>
	);
};

export const meta: ComponentMeta<DeviceProps> = {
	name: "Device",
	description:
		"SVG device mockups for showcasing your designs. Includes MacBook, iMac, iPhone, and iPad variants with support for custom content via src prop.",
	apiReference: "",
	variants: deviceVariants,
	examples: [
		{
			title: "Variants",
			description: "Different device mockups",
			code: () => (
				<div class="grid grid-cols-2 gap-8 items-center">
					<Device variant="iphone" class="w-32 mx-auto" />
					<Device variant="ipad" class="w-full" />
					<Device variant="macbook" class="w-full col-span-2" />
				</div>
			),
		},
		{
			title: "With Content",
			description: "Devices displaying custom images",
			code: () => (
				<div class="space-y-8">
					<Device
						variant="macbook"
						src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
						class="w-full max-w-2xl mx-auto"
					/>
					<div class="flex gap-8 justify-center items-end">
						<Device
							variant="iphone"
							src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=400&auto=format&fit=crop"
							class="w-32"
						/>
						<Device
							variant="ipad"
							src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
							class="w-80"
						/>
					</div>
				</div>
			),
		},
		{
			title: "Presentation",
			description: "Showcase on colored background",
			code: () => (
				<div class="bg-linear-to-br from-primary/20 to-accent p-12 rounded-lg">
					<div class="grid grid-cols-3 gap-6 items-end">
						<Device variant="iphone" class="w-full" />
						<Device variant="macbook" class="w-full col-span-2" />
					</div>
				</div>
			),
		},
	],
};

export default Device;
