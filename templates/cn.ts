import type { ClassValue } from "clsx";
import clsx from "clsx";
import { unoMerge } from "unocss-merge";

/**
 * Utility function to merge class names using clsx and unocss-merge
 * This is the standard `cn` function used throughout Method UI components
 *
 * When components are generated for end users, this import will be replaced
 * with the hardcoded function to make components completely self-contained.
 */
export const cn = (...classLists: ClassValue[]) => unoMerge(clsx(classLists));
