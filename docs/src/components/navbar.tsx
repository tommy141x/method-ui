import { A } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import IconBookOpen from "~icons/lucide/book-open";
import IconDownload from "~icons/lucide/download";
import IconMenu from "~icons/lucide/menu";
import IconPalette from "~icons/lucide/palette";
import IconRectangleVertical from "~icons/lucide/rectangle-vertical";
import IconRocket from "~icons/lucide/rocket";
import IconSparkles from "~icons/lucide/sparkles";
import IconSquareMousePointer from "~icons/lucide/square-mouse-pointer";
import IconTextCursorInput from "~icons/lucide/text-cursor-input";
import IconX from "~icons/lucide/x";
import { Button } from "./button";
import {
	NavMenu,
	NavMenuContent,
	NavMenuItem,
	NavMenuLink,
	NavMenuList,
	NavMenuTrigger,
} from "./nav-menu";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

	return (
		<header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div class="container mx-auto px-4 h-16 flex items-center justify-between">
				<div class="flex items-center gap-8">
					<A href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
						<h1 class="text-xl font-bold">Method UI</h1>
					</A>

					{/* Desktop Navigation with NavMenu */}
					<div class="hidden md:block">
						<NavMenu>
							<NavMenuList>
								<NavMenuItem>
									<NavMenuTrigger>Docs</NavMenuTrigger>
									<NavMenuContent class="p-2">
										<div class="grid gap-1 w-[280px]">
											<A
												href="/docs"
												class="flex items-start gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
											>
												<IconBookOpen class="h-5 w-5 mt-0.5" />
												<div>
													<div class="font-medium">Documentation</div>
													<div class="text-xs text-muted-foreground">
														Complete guides and references
													</div>
												</div>
											</A>
											<A
												href="/docs/getting-started"
												class="flex items-start gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
											>
												<IconRocket class="h-5 w-5 mt-0.5" />
												<div>
													<div class="font-medium">Getting Started</div>
													<div class="text-xs text-muted-foreground">Quick setup guide</div>
												</div>
											</A>
											<A
												href="/docs/installation"
												class="flex items-start gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
											>
												<IconDownload class="h-5 w-5 mt-0.5" />
												<div>
													<div class="font-medium">Installation</div>
													<div class="text-xs text-muted-foreground">Install Method UI</div>
												</div>
											</A>
											<A
												href="/docs/theming"
												class="flex items-start gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
											>
												<IconPalette class="h-5 w-5 mt-0.5" />
												<div>
													<div class="font-medium">Theming</div>
													<div class="text-xs text-muted-foreground">Customize your theme</div>
												</div>
											</A>
										</div>
									</NavMenuContent>
								</NavMenuItem>

								<NavMenuItem>
									<NavMenuTrigger>Components</NavMenuTrigger>
									<NavMenuContent class="p-2">
										<div class="flex gap-2">
											{/* Featured Card */}
											<A
												href="/components/button"
												class="w-[180px] shrink-0 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 p-4 transition-colors hover:from-primary/30 hover:to-primary/10"
											>
												<div class="flex flex-col gap-2">
													<IconSparkles class="h-8 w-8" />
													<div class="font-semibold">Featured</div>
													<div class="text-xs text-muted-foreground">
														Explore our component library
													</div>
												</div>
											</A>

											{/* Component Grid */}
											<div class="w-[280px] flex flex-col gap-1">
												<A
													href="/components/button"
													class="flex items-start gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
												>
													<IconSquareMousePointer class="h-5 w-5 mt-0.5" />
													<div>
														<div class="font-medium">Button</div>
														<div class="text-xs text-muted-foreground">
															Interactive button component
														</div>
													</div>
												</A>
												<A
													href="/components/input"
													class="flex items-start gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
												>
													<IconTextCursorInput class="h-5 w-5 mt-0.5" />
													<div>
														<div class="font-medium">Input</div>
														<div class="text-xs text-muted-foreground">Form input components</div>
													</div>
												</A>
												<A
													href="/components/dialog"
													class="flex items-start gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
												>
													<IconRectangleVertical class="h-5 w-5 mt-0.5" />
													<div>
														<div class="font-medium">Dialog</div>
														<div class="text-xs text-muted-foreground">Modal dialogs</div>
													</div>
												</A>
											</div>
										</div>
									</NavMenuContent>
								</NavMenuItem>

								<NavMenuItem>
									<NavMenuLink href="/blocks">Blocks</NavMenuLink>
								</NavMenuItem>

								<NavMenuItem>
									<NavMenuLink href="/themes">Themes</NavMenuLink>
								</NavMenuItem>
							</NavMenuList>
						</NavMenu>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<ThemeToggle />

					{/* Mobile Menu Button */}
					<Button
						variant="ghost"
						size="icon"
						class="md:hidden"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen())}
					>
						<Show when={mobileMenuOpen()} fallback={<IconMenu class="h-5 w-5" />}>
							<IconX class="h-5 w-5" />
						</Show>
					</Button>
				</div>
			</div>

			{/* Mobile Navigation */}
			<Show when={mobileMenuOpen()}>
				<div class="md:hidden border-t border-border bg-background">
					<nav class="container mx-auto px-4 py-4 flex flex-col gap-4">
						<div class="space-y-1">
							<div class="text-xs font-semibold text-muted-foreground px-3 py-2">DOCUMENTATION</div>
							<A
								href="/docs"
								class="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-2 hover:bg-accent"
								activeClass="text-foreground bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								Overview
							</A>
							<A
								href="/docs/getting-started"
								class="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-2 hover:bg-accent"
								activeClass="text-foreground bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								Getting Started
							</A>
							<A
								href="/docs/installation"
								class="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-2 hover:bg-accent"
								activeClass="text-foreground bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								Installation
							</A>
							<A
								href="/docs/theming"
								class="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-2 hover:bg-accent"
								activeClass="text-foreground bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								Theming
							</A>
						</div>

						<div class="space-y-1">
							<div class="text-xs font-semibold text-muted-foreground px-3 py-2">NAVIGATION</div>
							<A
								href="/components/button"
								class="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-2 hover:bg-accent"
								activeClass="text-foreground bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								Components
							</A>
							<A
								href="/blocks"
								class="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-2 hover:bg-accent"
								activeClass="text-foreground bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								Blocks
							</A>
							<A
								href="/themes"
								class="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md px-3 py-2 hover:bg-accent"
								activeClass="text-foreground bg-accent"
								onClick={() => setMobileMenuOpen(false)}
							>
								Themes
							</A>
						</div>
					</nav>
				</div>
			</Show>
		</header>
	);
}
