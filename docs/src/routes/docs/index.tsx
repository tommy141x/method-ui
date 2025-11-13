import { Title, Meta } from "@solidjs/meta";
import { Navbar } from "../../components/navbar";
import { DocsSidebar } from "../../components/docs-sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/card";

export default function DocsIndex() {
  return (
    <div class="min-h-screen bg-background">
      <Title>Introduction - Method UI Documentation</Title>
      <Meta
        name="description"
        content="Welcome to Method UI - a modern component library for SolidJS. Build accessible, customizable, and beautiful applications."
      />

      <Navbar />

      <div class="container mx-auto px-4 py-6">
        <div class="flex gap-6">
          <DocsSidebar />

          {/* Main Content */}
          <main class="flex-1 min-w-0">
            <div class="space-y-6">
              <div>
                <h1 class="text-4xl font-bold mb-4">Introduction</h1>
                <p class="text-lg text-muted-foreground mb-6">
                  Welcome to Method UI - a modern component library for SolidJS
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>What is Method UI?</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Method UI is a comprehensive component library built
                    specifically for SolidJS applications. It provides a
                    collection of accessible, customizable, and beautifully
                    designed components that you can copy and paste into your
                    apps.
                  </p>
                  <p>
                    Built on top of Ark UI, Method UI components follow WAI-ARIA
                    standards and provide excellent keyboard navigation and
                    screen reader support out of the box.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul class="space-y-2 list-disc list-inside">
                    <li>
                      🎨 Fully customizable with CSS variables and variants
                    </li>
                    <li>♿ Accessible components built with Ark UI</li>
                    <li>⚡ Blazing fast performance with SolidJS</li>
                    <li>📦 Copy and paste - no package installation</li>
                    <li>🎯 Full TypeScript support</li>
                    <li>🌙 Built-in dark mode</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Philosophy</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Method UI is designed with a "copy and paste" philosophy.
                    Rather than being a traditional npm package, you own the
                    code. This means:
                  </p>
                  <ul class="space-y-2 list-disc list-inside ml-4">
                    <li>
                      Complete control over the components in your project
                    </li>
                    <li>
                      No dependency on package updates or breaking changes
                    </li>
                    <li>
                      Easy customization without fighting against library
                      constraints
                    </li>
                    <li>Zero runtime overhead from unused components</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer class="border-t border-border mt-12">
        <div class="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Built with <span class="text-red-500">♥</span> using SolidJS, Ark
            UI, and UnoCSS
          </p>
        </div>
      </footer>
    </div>
  );
}
