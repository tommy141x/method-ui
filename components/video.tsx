import type { JSX, Component } from "solid-js";
import { splitProps, onMount, onCleanup, Show, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

export interface VideoProps extends JSX.VideoHTMLAttributes<HTMLVideoElement> {
  children?: JSX.Element;
  class?: string;
  options?: any;
  provider?: "html5" | "youtube" | "vimeo";
  src?: string;
  poster?: string;
}

export const Video: Component<VideoProps> = (props) => {
  const [local, videoProps] = splitProps(props, [
    "children",
    "class",
    "options",
    "provider",
    "src",
    "poster",
  ]);

  let videoRef: HTMLVideoElement | undefined;
  let player: any = undefined;
  const [mounted, setMounted] = createSignal(false);

  onMount(async () => {
    if (isServer || !videoRef) return;

    try {
      // Load Plyr CSS if not already loaded
      if (!document.querySelector('link[href*="plyr.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.plyr.io/3.7.8/plyr.css";
        document.head.appendChild(link);
      }

      const Plyr = (await import("plyr")).default;

      player = new Plyr(videoRef, local.options);

      if (local.src) {
        player.source = {
          type: "video",
          sources: [
            {
              src: local.src,
              provider: local.provider || "html5",
            },
          ],
          poster: local.poster,
        };
      }

      setMounted(true);
    } catch (error) {
      console.error("Failed to load Plyr:", error);
    }
  });

  onCleanup(() => {
    if (player && player.destroy) {
      player.destroy();
    }
  });

  return (
    <Show
      when={!isServer}
      fallback={
        <video
          class={cn("w-full", local.class)}
          poster={local.poster}
          controls
          {...videoProps}
        >
          {local.children}
        </video>
      }
    >
      <video
        ref={videoRef}
        class={cn("plyr", local.class)}
        playsinline
        controls
        data-poster={local.poster}
        {...videoProps}
      >
        {local.children}
      </video>
    </Show>
  );
};

export const meta: ComponentMeta<VideoProps> = {
  name: "Video",
  description:
    "A video player component powered by Plyr. Supports HTML5 video, YouTube, and Vimeo with a clean interface.",
  apiReference: "https://github.com/sampotts/plyr",
  examples: [
    {
      title: "Basic HTML5 Video",
      description: "Simple HTML5 video player",
      code: () => (
        <Video
          src="https://cdn.plyr.io/static/demo.mp4"
          poster="https://cdn.plyr.io/static/demo.jpg"
          class="max-w-2xl"
        >
          <track
            kind="captions"
            label="English"
            srclang="en"
            src="https://cdn.plyr.io/static/demo.vtt"
            default
          />
        </Video>
      ),
    },
    {
      title: "YouTube Video",
      description: "Embedded YouTube video with Plyr controls",
      code: () => (
        <Video
          provider="youtube"
          src="bTqVqk7FSmY"
          class="max-w-2xl"
          options={{
            youtube: { noCookie: true },
          }}
        />
      ),
    },
    {
      title: "Vimeo Video",
      description: "Embedded Vimeo video with Plyr controls",
      code: () => (
        <Video
          provider="vimeo"
          src="76979871"
          class="max-w-2xl"
          options={{
            vimeo: { byline: false, portrait: false, title: false },
          }}
        />
      ),
    },
  ],
};

export default Video;
