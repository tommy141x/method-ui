import { FileUpload as ArkFileUpload } from "@ark-ui/solid/file-upload";
import { cva, type VariantProps } from "class-variance-authority";
import { For, type JSX, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

const dropzoneVariants = cva(
	"flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed transition-colors cursor-pointer border-border bg-background hover:border-ring/50 hover:bg-accent/50 data-[dragging]:border-primary data-[dragging]:bg-primary/10",
	{
		variants: {
			size: {
				default: "min-h-[200px] p-6",
				sm: "min-h-[120px] p-4",
				lg: "min-h-[280px] p-8",
			},
		},
		defaultVariants: {
			size: "default",
		},
	}
);

interface FileUploadProps extends VariantProps<typeof dropzoneVariants> {
	children?: JSX.Element;
	accept?: string;
	maxFiles?: number;
	maxFileSize?: number;
	minFileSize?: number;
	disabled?: boolean;
	required?: boolean;
	name?: string;
	onFileChange?: (details: any) => void;
	onFileAccept?: (details: any) => void;
	onFileReject?: (details: any) => void;
	class?: string;
	allowDrop?: boolean;
	directory?: boolean;
}

export const FileUpload = (props: FileUploadProps) => {
	return (
		<ArkFileUpload.Root
			accept={props.accept}
			maxFiles={props.maxFiles}
			maxFileSize={props.maxFileSize}
			minFileSize={props.minFileSize}
			disabled={props.disabled}
			required={props.required}
			name={props.name}
			onFileChange={props.onFileChange}
			onFileAccept={props.onFileAccept}
			onFileReject={props.onFileReject}
			allowDrop={props.allowDrop}
			directory={props.directory}
		>
			<div class="space-y-4 max-w-full">
				<ArkFileUpload.Dropzone
					class={cn(
						dropzoneVariants({
							size: props.size,
						}),
						props.class
					)}
				>
					<ArkFileUpload.Trigger class="w-full h-full flex flex-col items-center gap-2 text-center">
						<div
							class={cn("flex h-12 w-12 items-center justify-center rounded-full bg-primary/10")}
						>
							<div class={cn("h-6 w-6 text-primary", icon("upload"))} />
						</div>
						<div class="space-y-1">
							<p class="text-sm font-medium text-foreground">Drop files here or click to browse</p>
							<p class="text-xs text-muted-foreground">
								{props.accept ? `Accepted formats: ${props.accept}` : "All file types accepted"}
							</p>
						</div>
					</ArkFileUpload.Trigger>
				</ArkFileUpload.Dropzone>

				<ArkFileUpload.Context>
					{(context) => (
						<Presence exitBeforeEnter={false}>
							<Show when={context().acceptedFiles.length > 0}>
								<Motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3, easing: "ease-in-out" }}
								>
									<ArkFileUpload.ItemGroup class="w-full overflow-hidden">
										<div class="space-y-2">
											<Motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.2 }}
												class="flex items-center justify-between"
											>
												<p class="text-sm font-medium">
													Uploaded Files ({context().acceptedFiles.length})
												</p>
												<button
													type="button"
													onClick={() => context().clearFiles()}
													class="text-xs text-muted-foreground hover:text-foreground transition-colors"
												>
													Clear all
												</button>
											</Motion.div>
											<div class="space-y-2 overflow-hidden">
												<For each={context().acceptedFiles}>
													{(file, index) => (
														<Motion.li
															initial={{ opacity: 0, x: -20, scale: 0.95 }}
															animate={{ opacity: 1, x: 0, scale: 1 }}
															exit={{ opacity: 0, x: 20, scale: 0.95 }}
															transition={{
																duration: 0.3,
																delay: index() * 0.05,
																easing: "ease-out",
															}}
														>
															<ArkFileUpload.Item
																file={file}
																class="flex items-center gap-3 rounded-md border border-border bg-background p-3 transition-colors hover:bg-accent/50 w-full"
															>
																<ArkFileUpload.Context>
																	{(_itemContext) => (
																		<>
																			<Show when={file.type.startsWith("image/")}>
																				<ArkFileUpload.ItemPreview type="image/*" class="shrink-0">
																					<ArkFileUpload.ItemPreviewImage class="h-12 w-12 rounded object-cover" />
																				</ArkFileUpload.ItemPreview>
																			</Show>
																			<Show when={!file.type.startsWith("image/")}>
																				<ArkFileUpload.ItemPreview
																					type=".*"
																					class="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted"
																				>
																					<div
																						class={cn(
																							"h-5 w-5 text-muted-foreground",
																							icon("file")
																						)}
																					/>
																				</ArkFileUpload.ItemPreview>
																			</Show>
																		</>
																	)}
																</ArkFileUpload.Context>
																<div class="flex-1 min-w-0" style="max-width: calc(100% - 5rem);">
																	<ArkFileUpload.ItemName
																		class="text-sm font-medium block overflow-hidden"
																		style="word-break: break-all; overflow-wrap: break-word;"
																	/>
																	<ArkFileUpload.ItemSizeText class="text-xs text-muted-foreground block" />
																</div>
																<ArkFileUpload.ItemDeleteTrigger class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 shrink-0">
																	<div class={cn("h-4 w-4", icon("x"))} />
																</ArkFileUpload.ItemDeleteTrigger>
															</ArkFileUpload.Item>
														</Motion.li>
													)}
												</For>
											</div>
										</div>
									</ArkFileUpload.ItemGroup>
								</Motion.div>
							</Show>
						</Presence>
					)}
				</ArkFileUpload.Context>

				<ArkFileUpload.Context>
					{(context) => (
						<Presence exitBeforeEnter={false}>
							<Show when={context().rejectedFiles.length > 0}>
								<Motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3, easing: "ease-in-out" }}
								>
									<ArkFileUpload.ItemGroup type="rejected">
										<div class="space-y-2">
											<Motion.p
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.2 }}
												class="text-sm font-medium text-destructive"
											>
												Rejected Files ({context().rejectedFiles.length})
											</Motion.p>
											<div class="space-y-2">
												<For each={context().rejectedFiles}>
													{(fileRejection, index) => (
														<Motion.li
															initial={{ opacity: 0, x: -20, scale: 0.95 }}
															animate={{ opacity: 1, x: 0, scale: 1 }}
															exit={{ opacity: 0, x: 20, scale: 0.95 }}
															transition={{
																duration: 0.3,
																delay: index() * 0.05,
																easing: "ease-out",
															}}
														>
															<ArkFileUpload.Item
																file={fileRejection.file}
																class="flex items-center gap-3 rounded-md border border-destructive/50 bg-destructive/5 p-3"
															>
																<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-destructive/10">
																	<div
																		class={cn("h-5 w-5 text-destructive", icon("alert-circle"))}
																	/>
																</div>
																<div class="flex-1 min-w-0">
																	<ArkFileUpload.ItemName class="text-sm font-medium truncate" />
																	<div class="mt-1 space-y-0.5">
																		<For each={fileRejection.errors}>
																			{(error) => <p class="text-xs text-destructive">{error}</p>}
																		</For>
																	</div>
																</div>
															</ArkFileUpload.Item>
														</Motion.li>
													)}
												</For>
											</div>
										</div>
									</ArkFileUpload.ItemGroup>
								</Motion.div>
							</Show>
						</Presence>
					)}
				</ArkFileUpload.Context>

				<ArkFileUpload.HiddenInput />
			</div>
		</ArkFileUpload.Root>
	);
};

export const meta: ComponentMeta<FileUploadProps> = {
	name: "FileUpload",
	description:
		"File upload component built with Ark UI. Supports drag and drop, file type restrictions, file size limits, and automatic preview generation for images.",
	variants: dropzoneVariants,
	examples: [
		{
			title: "Basic File Upload",
			description: "Simple file upload with drag and drop",
			code: () => <FileUpload maxFiles={5} />,
		},
		{
			title: "Image Upload Only",
			description: "Restrict uploads to image files",
			code: () => (
				<FileUpload
					accept="image/png,image/jpeg,image/jpg,image/gif"
					maxFiles={3}
					maxFileSize={5 * 1024 * 1024}
				/>
			),
		},
	],
};

export default FileUpload;
