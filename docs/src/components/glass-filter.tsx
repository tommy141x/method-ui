import type { JSX } from "solid-js";

/**
 * GlassFilter - SVG filter definition for glass morphism effects
 *
 * This component provides an SVG filter that creates a subtle glass distortion effect
 * used in backdrop-filter CSS properties. It must be rendered somewhere in your app
 * (typically at the root level) for the glass theme to work properly.
 *
 * The filter uses feImage for displacement mapping with a procedural turbulence fallback.
 * You can replace the feImage href with your own distortion map image for custom effects.
 *
 * @example
 * // In your root layout/app component:
 * import { GlassFilter } from "~/components/glass-filter";
 *
 * export default function App() {
 *   return (
 *     <>
 *       <GlassFilter />
 *       <YourAppContent />
 *     </>
 *   );
 * }
 */
export function GlassFilter(): JSX.Element {
	return (
		<svg style="position:absolute; width:0; height:0;" aria-hidden="true">
			<filter id="glass" x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse">
				<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="5" result="noise" />

				<feColorMatrix
					in="noise"
					type="matrix"
					values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 20 -10"
					result="contrastNoise"
				/>

				<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />

				<feDisplacementMap
					in="blur"
					in2="contrastNoise"
					scale="40"
					xChannelSelector="R"
					yChannelSelector="G"
				/>
			</filter>
		</svg>
	);
}

export default GlassFilter;
