import { A } from "@solidjs/router";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./button";
import { cn } from "@lib/cn";
import { createSignal } from "solid-js";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  return (
    <header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <A
            href="/"
            class="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h1 class="text-xl font-bold">Method UI</h1>
          </A>

          {/* Desktop Navigation */}
          <nav class="hidden md:flex items-center gap-6">
            <A
              href="/docs"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
            >
              Docs
            </A>
            <A
              href="/components/button"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
            >
              Components
            </A>
            <A
              href="/blocks"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
            >
              Blocks
            </A>
            <A
              href="/themes"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
            >
              Themes
            </A>
          </nav>
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
            <div
              class={cn(
                "h-5 w-5",
                mobileMenuOpen() ? "i-lucide-x" : "i-lucide-menu",
              )}
            />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen() && (
        <div class="md:hidden border-t border-border bg-background">
          <nav class="container mx-auto px-4 py-4 flex flex-col gap-4">
            <A
              href="/docs"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </A>
            <A
              href="/components/button"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Components
            </A>
            <A
              href="/blocks"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blocks
            </A>
            <A
              href="/themes"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClass="text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Themes
            </A>
          </nav>
        </div>
      )}
    </header>
  );
}
