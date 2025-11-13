import type { JSX, Component } from "solid-js";
import {
  createSignal,
  onCleanup,
  onMount,
  createEffect,
  createMemo,
} from "solid-js";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";
import { cva, type VariantProps } from "class-variance-authority";
import * as echarts from "echarts/core";
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  CandlestickChart,
  HeatmapChart,
  TreeChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  RadarSeriesOption,
  GaugeSeriesOption,
  FunnelSeriesOption,
  CandlestickSeriesOption,
  TreeSeriesOption,
} from "echarts/charts";
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  LegendComponentOption,
  ToolboxComponentOption,
  VisualMapComponentOption,
  DataZoomComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";

// Register required components
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  FunnelChart,
  CandlestickChart,
  HeatmapChart,
  TreeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

// Compose ECharts option type
type ECOption =
  | ComposeOption<
      | BarSeriesOption
      | LineSeriesOption
      | PieSeriesOption
      | ScatterSeriesOption
      | RadarSeriesOption
      | GaugeSeriesOption
      | FunnelSeriesOption
      | CandlestickSeriesOption
      | TreeSeriesOption
      | TitleComponentOption
      | TooltipComponentOption
      | GridComponentOption
      | DatasetComponentOption
      | LegendComponentOption
      | ToolboxComponentOption
      | VisualMapComponentOption
      | DataZoomComponentOption
    >
  | any;

// Helper function to get CSS variable color value
const getCSSVariable = (variable: string): string => {
  if (typeof window === "undefined") return "";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return value ? `hsl(${value})` : "";
};

// Create theme based on CSS variables
const createThemeFromCSSVariables = () => {
  const background = getCSSVariable("--background");
  const foreground = getCSSVariable("--foreground");
  const primary = getCSSVariable("--primary");
  const secondary = getCSSVariable("--secondary");
  const muted = getCSSVariable("--muted");
  const mutedForeground = getCSSVariable("--muted-foreground");
  const border = getCSSVariable("--border");
  const destructive = getCSSVariable("--destructive");

  // Get font family from body element (set in global.css with font-sans)
  const fontFamily =
    typeof window !== "undefined"
      ? window.getComputedStyle(document.body).fontFamily
      : "sans-serif";

  return {
    backgroundColor: "transparent",
    textStyle: {
      color: foreground,
      fontFamily: fontFamily,
    },
    title: {
      textStyle: {
        color: foreground,
      },
      subtextStyle: {
        color: mutedForeground,
      },
    },
    grid: {
      backgroundColor: "transparent",
      borderColor: border,
    },
    line: {
      itemStyle: {
        borderWidth: 2,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 6,
      symbol: "circle",
      smooth: true,
      emphasis: {
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.3)",
        },
      },
    },
    radar: {
      itemStyle: {
        borderWidth: 2,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 6,
      symbol: "circle",
      smooth: true,
    },
    bar: {
      itemStyle: {
        barBorderWidth: 0,
        barBorderColor: border,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.3)",
        },
      },
    },
    pie: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
      emphasis: {
        focus: "none",
        scale: false,
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.3)",
        },
      },
    },
    scatter: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
    },
    boxplot: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
    },
    sankey: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
    },
    funnel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
    },
    gauge: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.25, getCSSVariable("--chart-1")],
            [0.5, getCSSVariable("--chart-2")],
            [0.75, getCSSVariable("--chart-3")],
            [1, getCSSVariable("--chart-4")],
          ],
        },
      },
      pointer: {
        itemStyle: {
          color: primary,
        },
      },
      axisTick: {
        lineStyle: {
          color: primary,
        },
      },
      splitLine: {
        lineStyle: {
          color: primary,
        },
      },
      axisLabel: {
        color: foreground,
      },
      title: {
        color: foreground,
      },
      detail: {
        color: primary,
      },
    },
    candlestick: {
      itemStyle: {
        color: primary,
        color0: secondary,
        borderColor: primary,
        borderColor0: secondary,
        borderWidth: 1,
      },
    },
    graph: {
      itemStyle: {
        borderWidth: 0,
        borderColor: border,
      },
      lineStyle: {
        width: 1,
        color: mutedForeground,
      },
      symbolSize: 6,
      symbol: "circle",
      smooth: true,
      color: [primary, secondary, destructive, muted],
      label: {
        color: foreground,
      },
    },
    map: {
      itemStyle: {
        areaColor: muted,
        borderColor: border,
        borderWidth: 0.5,
      },
      label: {
        color: foreground,
      },
      emphasis: {
        itemStyle: {
          areaColor: primary,
          borderColor: border,
          borderWidth: 1,
        },
        label: {
          color: foreground,
        },
      },
    },
    geo: {
      itemStyle: {
        areaColor: muted,
        borderColor: border,
        borderWidth: 0.5,
      },
      label: {
        color: foreground,
      },
      emphasis: {
        itemStyle: {
          areaColor: primary,
          borderColor: border,
          borderWidth: 1,
        },
        label: {
          color: foreground,
        },
      },
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: border,
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: border,
        },
      },
      axisLabel: {
        show: true,
        color: mutedForeground,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [border],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [muted],
        },
      },
    },
    valueAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: border,
        },
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: border,
        },
      },
      axisLabel: {
        show: true,
        color: mutedForeground,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [border],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [muted],
        },
      },
      nameTextStyle: {
        color: foreground,
      },
    },
    logAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: border,
        },
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: border,
        },
      },
      axisLabel: {
        show: true,
        color: mutedForeground,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [border],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [muted],
        },
      },
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: border,
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: border,
        },
      },
      axisLabel: {
        show: true,
        color: mutedForeground,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [border],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [muted],
        },
      },
    },
    toolbox: {
      iconStyle: {
        borderColor: mutedForeground,
      },
      emphasis: {
        iconStyle: {
          borderColor: foreground,
        },
      },
    },
    axisPointer: {
      lineStyle: {
        color: border,
      },
      crossStyle: {
        color: border,
      },
      label: {
        backgroundColor: muted,
        color: foreground,
      },
    },
    legend: {
      textStyle: {
        color: foreground,
      },
    },
    tooltip: {
      backgroundColor: getCSSVariable("--popover"),
      borderColor: border,
      borderWidth: 1,
      textStyle: {
        color: foreground,
      },
      axisPointer: {
        lineStyle: {
          color: border,
          width: 1,
        },
        crossStyle: {
          color: border,
          width: 1,
        },
      },
    },
    timeline: {
      lineStyle: {
        color: border,
        width: 1,
      },
      itemStyle: {
        color: primary,
        borderWidth: 1,
      },
      controlStyle: {
        color: foreground,
        borderColor: border,
        borderWidth: 0.5,
      },
      checkpointStyle: {
        color: primary,
        borderColor: border,
      },
      label: {
        color: foreground,
      },
      emphasis: {
        itemStyle: {
          color: primary,
        },
        controlStyle: {
          color: foreground,
          borderColor: border,
          borderWidth: 0.5,
        },
        label: {
          color: foreground,
        },
      },
    },
    visualMap: {
      textStyle: {
        color: foreground,
      },
    },
    dataZoom: {
      backgroundColor: muted,
      dataBackgroundColor: secondary,
      fillerColor: `${primary}33`,
      handleColor: primary,
      handleSize: "100%",
      textStyle: {
        color: foreground,
      },
      borderColor: border,
    },
    markPoint: {
      label: {
        color: foreground,
      },
      emphasis: {
        label: {
          color: foreground,
        },
      },
    },
    color: [
      getCSSVariable("--chart-1"),
      getCSSVariable("--chart-2"),
      getCSSVariable("--chart-3"),
      getCSSVariable("--chart-4"),
      getCSSVariable("--chart-5"),
      primary,
      secondary,
    ],
  };
};

// Helper to get color scheme for chart options
const getColorScheme = () => {
  return [
    getCSSVariable("--chart-1"),
    getCSSVariable("--chart-2"),
    getCSSVariable("--chart-3"),
    getCSSVariable("--chart-4"),
    getCSSVariable("--chart-5"),
    getCSSVariable("--primary"),
    getCSSVariable("--secondary"),
  ];
};

const chartVariants = cva(
  "relative w-full h-full rounded-lg border border-border bg-card overflow-hidden transition-colors duration-200",
  {
    variants: {
      variant: {
        bar: "",
        line: "",
        pie: "",
        scatter: "",
        radar: "",
        gauge: "",
        funnel: "",
        candlestick: "",
        tree: "",
        mixed: "",
      },
      size: {
        sm: "h-64",
        md: "h-80",
        lg: "h-96",
        xl: "h-[32rem]",
        full: "h-full",
      },
    },
    defaultVariants: {
      variant: "bar",
      size: "md",
    },
  },
);

// Deep merge utility to properly merge theme and user options
const deepMerge = (target: any, source: any): any => {
  if (!source) return target;
  if (!target) return source;

  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
};

type ChartProps = {
  option: ECOption;
  theme?: string | object;
  loading?: boolean;
  loadingOption?: object;
  onChartReady?: (chart: echarts.ECharts) => void;
  onEvents?: Record<string, (params: any) => void>;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  showLoading?: boolean;
  class?: string;
  style?: JSX.CSSProperties;
  id?: string;
  autoResize?: boolean;
  useTheme?: boolean;
} & VariantProps<typeof chartVariants>;

export const Chart: Component<ChartProps> = (props) => {
  let containerRef: HTMLDivElement | undefined;
  const [chartInstance, setChartInstance] = createSignal<
    echarts.ECharts | undefined
  >(undefined);
  const [isClient, setIsClient] = createSignal(false);
  const [themeColors, setThemeColors] = createSignal({
    foreground: "",
    background: "",
    primary: "",
  });

  // Get current theme colors from CSS variables
  const getCurrentThemeColors = () => {
    if (typeof window === "undefined") {
      return { foreground: "", background: "", primary: "" };
    }
    return {
      foreground: getCSSVariable("--foreground"),
      background: getCSSVariable("--background"),
      primary: getCSSVariable("--primary"),
    };
  };

  // Create dynamic theme based on CSS variables
  const dynamicTheme = createMemo(() => {
    if (!isClient() || props.useTheme === false) return null;
    // Track themeColors to force recomputation when theme changes
    const _ = themeColors();
    return createThemeFromCSSVariables();
  });

  // Merge user options with theme-aware defaults
  const mergedOption = createMemo((): ECOption => {
    const base = props.option;
    const theme = dynamicTheme();
    // Track themeColors to force recomputation when theme changes
    const _ = themeColors();

    if (!theme || props.useTheme === false) return base;

    // Get fresh CSS variables for reactive updates - called inside memo so they update with theme
    const colorScheme = isClient() ? getColorScheme() : theme.color;

    // Deep merge to ensure colors update throughout
    // Always merge common components, only merge optional ones if user specified them
    const merged: ECOption = {
      ...base,
      backgroundColor: "transparent",
      textStyle: deepMerge(theme.textStyle, base.textStyle),
      color: base.color || colorScheme,
      // Common components - always merge theme styles
      tooltip: deepMerge(theme.tooltip, base.tooltip),
      legend: deepMerge(theme.legend, base.legend),
      axisPointer: deepMerge(theme.axisPointer, base.axisPointer),
      categoryAxis: deepMerge(theme.categoryAxis, base.categoryAxis),
      valueAxis: deepMerge(theme.valueAxis, base.valueAxis),
      logAxis: deepMerge(theme.logAxis, base.logAxis),
      timeAxis: deepMerge(theme.timeAxis, base.timeAxis),
    };

    // Optional components - only merge if user has specified them
    if (base.title) merged.title = deepMerge(theme.title, base.title);
    if (base.grid) merged.grid = deepMerge(theme.grid, base.grid);
    if (base.timeline)
      merged.timeline = deepMerge(theme.timeline, base.timeline);
    if (base.visualMap)
      merged.visualMap = deepMerge(theme.visualMap, base.visualMap);
    if (base.dataZoom)
      merged.dataZoom = deepMerge(theme.dataZoom, base.dataZoom);
    if (base.markPoint)
      merged.markPoint = deepMerge(theme.markPoint, base.markPoint);

    // Ensure series colors update with theme
    if (merged.series && Array.isArray(merged.series)) {
      merged.series = merged.series.map((s: any, index: number) => {
        const seriesColor = Array.isArray(colorScheme)
          ? colorScheme[index % colorScheme.length]
          : colorScheme[0];

        // Get fresh CSS variables inside the map for reactivity
        const foregroundColor = getCSSVariable("--foreground");
        const backgroundColor = getCSSVariable("--background");

        // For line charts with areaStyle - preserve gradient on hover
        if (s.type === "line" && s.areaStyle && !s.itemStyle?.color) {
          return {
            ...s,
            itemStyle: {
              ...s.itemStyle,
              color: seriesColor,
            },
            lineStyle: {
              ...s.lineStyle,
              color: seriesColor,
            },
            areaStyle: {
              ...s.areaStyle,
            },
            emphasis: {
              focus: "none",
              blurScope: "none",
              scale: false,
              lineStyle: {
                width: 3,
                color: seriesColor,
                ...s.emphasis?.lineStyle,
              },
              itemStyle: {
                color: seriesColor,
                ...s.emphasis?.itemStyle,
              },
              areaStyle: {
                // Preserve the original areaStyle including gradients from user
                ...s.areaStyle,
                // Then allow user's explicit emphasis areaStyle overrides
                ...(s.emphasis?.areaStyle || {}),
              },
            },
            blur: {
              lineStyle: {
                ...s.lineStyle,
              },
              itemStyle: {
                ...s.itemStyle,
              },
              areaStyle: {
                ...s.areaStyle,
              },
            },
          };
        }

        // For bar charts without explicit colors
        if (!s.itemStyle?.color && s.type === "bar") {
          return {
            ...s,
            itemStyle: {
              ...s.itemStyle,
              color: seriesColor,
            },
            emphasis: {
              ...s.emphasis,
              itemStyle: {
                ...s.emphasis?.itemStyle,
                color: seriesColor,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.3)",
              },
            },
          };
        }

        // For line charts without explicit colors
        if (!s.itemStyle?.color && s.type === "line") {
          return {
            ...s,
            itemStyle: {
              ...s.itemStyle,
              color: seriesColor,
            },
            lineStyle: {
              ...s.lineStyle,
              color: seriesColor,
            },
            emphasis: {
              ...s.emphasis,
              lineStyle: {
                ...s.emphasis?.lineStyle,
                width: 3,
                color: seriesColor,
              },
              itemStyle: {
                ...s.emphasis?.itemStyle,
                color: seriesColor,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.3)",
              },
            },
          };
        }

        // For pie charts - always apply styling
        if (s.type === "pie") {
          // Preserve existing data colors but fix emphasis behavior and apply label colors
          const pieData = s.data
            ? s.data.map((item: any, i: number) => {
                const itemColor =
                  item.itemStyle?.color ||
                  (Array.isArray(colorScheme)
                    ? colorScheme[i % colorScheme.length]
                    : seriesColor);
                return {
                  ...item,
                  itemStyle: {
                    ...item.itemStyle,
                    color: itemColor,
                  },
                  label: {
                    ...item.label,
                    color: foregroundColor,
                    textBorderColor: backgroundColor,
                    textBorderWidth: 0,
                  },
                  emphasis: {
                    ...item.emphasis,
                    disabled: false,
                    itemStyle: {
                      ...item.emphasis?.itemStyle,
                      color: itemColor,
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: "rgba(0, 0, 0, 0.3)",
                    },
                    label: {
                      ...item.emphasis?.label,
                      color: foregroundColor,
                      textBorderColor: backgroundColor,
                      textBorderWidth: 0,
                    },
                  },
                };
              })
            : s.data;

          return {
            ...s,
            data: pieData,
            label: {
              color: foregroundColor,
              textBorderColor: backgroundColor,
              textBorderWidth: 0,
              textShadowColor: "transparent",
              textShadowBlur: 0,
            },
            emphasis: {
              focus: "none",
              scale: false,
              label: {
                color: foregroundColor,
                textBorderColor: backgroundColor,
                textBorderWidth: 0,
                textShadowColor: "transparent",
                textShadowBlur: 0,
              },
            },
          };
        }

        // For gauge charts - apply proper coloring
        if (s.type === "gauge") {
          return {
            ...s,
            axisLine: {
              ...s.axisLine,
              lineStyle: {
                ...s.axisLine?.lineStyle,
                color: s.axisLine?.lineStyle?.color || [
                  [0.25, colorScheme[0] || getCSSVariable("--chart-1")],
                  [0.5, colorScheme[1] || getCSSVariable("--chart-2")],
                  [0.75, colorScheme[2] || getCSSVariable("--chart-3")],
                  [1, colorScheme[3] || getCSSVariable("--chart-4")],
                ],
              },
            },
            pointer: {
              ...s.pointer,
              itemStyle: {
                ...s.pointer?.itemStyle,
                color:
                  s.pointer?.itemStyle?.color || getCSSVariable("--primary"),
              },
            },
            axisTick: {
              ...s.axisTick,
              lineStyle: {
                ...s.axisTick?.lineStyle,
                color:
                  s.axisTick?.lineStyle?.color || getCSSVariable("--primary"),
              },
            },
            splitLine: {
              ...s.splitLine,
              lineStyle: {
                ...s.splitLine?.lineStyle,
                color:
                  s.splitLine?.lineStyle?.color || getCSSVariable("--primary"),
              },
            },
            axisLabel: {
              ...s.axisLabel,
              color: s.axisLabel?.color || foregroundColor,
            },
            title: {
              ...s.title,
              color: s.title?.color || foregroundColor,
            },
            detail: {
              ...s.detail,
              color: s.detail?.color || getCSSVariable("--primary"),
            },
          };
        }

        // For tree charts - apply proper label coloring
        if (s.type === "tree") {
          return {
            ...s,
            label: {
              color: foregroundColor,
              textBorderColor: "transparent",
              textBorderWidth: 0,
              ...s.label,
            },
            leaves: {
              ...s.leaves,
              label: {
                color: foregroundColor,
                textBorderColor: "transparent",
                textBorderWidth: 0,
                ...s.leaves?.label,
              },
            },
            itemStyle: {
              ...s.itemStyle,
              color: seriesColor,
            },
            lineStyle: {
              ...s.lineStyle,
              color: seriesColor,
            },
            emphasis: {
              ...s.emphasis,
              label: {
                color: foregroundColor,
                ...s.emphasis?.label,
              },
            },
          };
        }

        // For scatter charts - apply proper coloring
        if (s.type === "scatter") {
          return {
            ...s,
            itemStyle: {
              ...s.itemStyle,
              color: s.itemStyle?.color || seriesColor,
            },
            label: {
              color: foregroundColor,
              textBorderColor: "transparent",
              textBorderWidth: 0,
              ...s.label,
            },
            emphasis: {
              ...s.emphasis,
              itemStyle: {
                ...s.emphasis?.itemStyle,
                color: s.emphasis?.itemStyle?.color || seriesColor,
              },
              label: {
                color: foregroundColor,
                ...s.emphasis?.label,
              },
            },
          };
        }

        // For radar charts - apply proper coloring
        if (s.type === "radar") {
          return {
            ...s,
            itemStyle: {
              ...s.itemStyle,
              color: s.itemStyle?.color || seriesColor,
            },
            lineStyle: {
              ...s.lineStyle,
              color: s.lineStyle?.color || seriesColor,
            },
            areaStyle: {
              ...s.areaStyle,
              color: s.areaStyle?.color || seriesColor,
            },
            label: {
              color: foregroundColor,
              textBorderColor: "transparent",
              textBorderWidth: 0,
              ...s.label,
            },
            emphasis: {
              ...s.emphasis,
              label: {
                color: foregroundColor,
                ...s.emphasis?.label,
              },
            },
          };
        }

        // For funnel charts - apply proper label coloring
        if (s.type === "funnel") {
          return {
            ...s,
            itemStyle: {
              ...s.itemStyle,
              color: s.itemStyle?.color || seriesColor,
            },
            label: {
              color: foregroundColor,
              textBorderColor: "transparent",
              textBorderWidth: 0,
              ...s.label,
            },
            labelLine: {
              ...s.labelLine,
              lineStyle: {
                ...s.labelLine?.lineStyle,
                color: foregroundColor,
              },
            },
            emphasis: {
              ...s.emphasis,
              label: {
                color: foregroundColor,
                ...s.emphasis?.label,
              },
            },
          };
        }

        // For candlestick charts - apply proper coloring
        if (s.type === "candlestick") {
          return {
            ...s,
            itemStyle: {
              color: getCSSVariable("--primary"),
              color0: getCSSVariable("--secondary"),
              borderColor: getCSSVariable("--primary"),
              borderColor0: getCSSVariable("--secondary"),
              ...s.itemStyle,
            },
            emphasis: {
              ...s.emphasis,
              itemStyle: {
                color: getCSSVariable("--primary"),
                color0: getCSSVariable("--secondary"),
                borderColor: getCSSVariable("--primary"),
                borderColor0: getCSSVariable("--secondary"),
                ...s.emphasis?.itemStyle,
              },
            },
          };
        }

        // For heatmap charts - apply proper label coloring
        if (s.type === "heatmap") {
          return {
            ...s,
            label: {
              color: foregroundColor,
              textBorderColor: "transparent",
              textBorderWidth: 0,
              ...s.label,
            },
            emphasis: {
              ...s.emphasis,
              itemStyle: {
                ...s.emphasis?.itemStyle,
              },
              label: {
                color: foregroundColor,
                ...s.emphasis?.label,
              },
            },
          };
        }

        return s;
      });
    }

    return merged;
  });

  onMount(() => {
    setIsClient(true);
    setThemeColors(getCurrentThemeColors());

    if (!containerRef) return;

    let resizeObserver: ResizeObserver | null = null;
    let themeObserver: MutationObserver | null = null;

    // Wait for container to have dimensions
    const initChart = () => {
      if (!containerRef) return;

      // Check if container has dimensions
      const width = containerRef.clientWidth;
      const height = containerRef.clientHeight;

      if (width === 0 || height === 0) {
        // Container not ready yet, try again
        requestAnimationFrame(initChart);
        return;
      }

      // Initialize chart with theme
      const themeToUse =
        props.theme || (props.useTheme !== false ? dynamicTheme() : undefined);

      const newChart = echarts.init(containerRef, themeToUse, {
        renderer: "canvas",
      });

      // Set initial option
      newChart.setOption(mergedOption(), props.notMerge, props.lazyUpdate);

      // Wait for fonts to load, then refresh chart to apply custom fonts
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => {
          if (newChart && !newChart.isDisposed()) {
            newChart.setOption(mergedOption(), false, props.lazyUpdate);
          }
        });
      }

      // Store in signal
      setChartInstance(newChart);

      // Trigger onChartReady callback
      if (props.onChartReady) {
        props.onChartReady(newChart);
      }

      // Bind events
      if (props.onEvents) {
        Object.entries(props.onEvents).forEach(([eventName, handler]) => {
          newChart.on(eventName, handler);
        });
      }

      // Handle resize
      resizeObserver = new ResizeObserver(() => {
        if (props.autoResize !== false) {
          const chart = chartInstance();
          chart?.resize();
        }
      });

      if (containerRef) {
        resizeObserver.observe(containerRef);
      }

      // Observe theme changes by watching CSS variables
      themeObserver = new MutationObserver(() => {
        const newColors = getCurrentThemeColors();
        const oldColors = themeColors();

        // Check if any theme colors have changed
        if (
          newColors.foreground !== oldColors.foreground ||
          newColors.background !== oldColors.background ||
          newColors.primary !== oldColors.primary
        ) {
          setThemeColors(newColors);
          // Update chart colors dynamically without disposal
          const chart = chartInstance();
          if (chart && props.useTheme !== false) {
            // Force not merge to ensure all colors update
            chart.setOption(mergedOption(), true, props.lazyUpdate);
          }
        }
      });

      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
    };

    // Start initialization on next frame
    requestAnimationFrame(initChart);

    // Cleanup
    onCleanup(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (themeObserver) {
        themeObserver.disconnect();
      }
      const chart = chartInstance();
      if (chart) {
        if (props.onEvents) {
          Object.entries(props.onEvents).forEach(([eventName, handler]) => {
            chart.off(eventName, handler);
          });
        }
        chart.dispose();
        setChartInstance(undefined);
      }
    });
  });

  // Update chart when option changes
  createEffect(() => {
    const chart = chartInstance();
    if (chart && isClient()) {
      try {
        chart.setOption(mergedOption(), props.notMerge, props.lazyUpdate);
      } catch (error) {
        console.warn("Chart update error:", error);
      }
    }
  });

  // Handle loading state
  createEffect(() => {
    const chart = chartInstance();
    if (!chart) return;

    if (props.loading || props.showLoading) {
      chart.showLoading("default", props.loadingOption);
    } else {
      chart.hideLoading();
    }
  });

  return (
    <div
      ref={containerRef}
      id={props.id}
      class={cn(
        chartVariants({ variant: props.variant, size: props.size }),
        props.class,
      )}
      style={props.style}
    />
  );
};

export const meta: ComponentMeta<ChartProps> = {
  name: "Chart",
  description:
    "A powerful chart component built with Apache ECharts. Supports multiple chart types including bar, line, pie, scatter, radar, gauge, funnel, and candlestick charts. Automatically integrates with your design system's CSS variables and supports dark mode. Fully compatible with SolidJS SSR.",
  apiReference: "https://echarts.apache.org/en/api.html",
  variants: chartVariants,
  examples: [
    {
      title: "Dynamic Line Chart with Gradient",
      description: "Real-time updating line chart with gradient fill",
      code: () => {
        const initialData = Array.from(
          { length: 20 },
          () => Math.floor(Math.random() * 100) + 20,
        );
        const [data, setData] = createSignal(initialData);
        let chartRef: any;

        onMount(() => {
          const interval = setInterval(() => {
            setData((prev) => {
              if (!prev || prev.length === 0) return initialData;
              const newData = [...prev.slice(1)];
              newData.push(Math.floor(Math.random() * 100) + 20);
              return newData;
            });
          }, 1000);

          onCleanup(() => clearInterval(interval));
        });

        createEffect(() => {
          const currentData = data();
          if (chartRef && currentData) {
            chartRef.setOption({
              series: [
                {
                  name: "Value",
                  data: currentData,
                },
              ],
            });
          }
        });

        return (
          <Chart
            variant="line"
            option={{
              title: {
                text: "Real-time Data Stream",
              },
              tooltip: {
                trigger: "axis",
              },
              xAxis: {
                type: "category",
                boundaryGap: false,
                data: Array.from({ length: 20 }, (_, i) => i),
              },
              yAxis: {
                type: "value",
                boundaryGap: [0, "10%"],
              },
              series: [
                {
                  name: "Value",
                  type: "line",
                  smooth: true,
                  symbol: "none",
                  areaStyle: {
                    color: {
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        {
                          offset: 0,
                          color: "rgba(59, 130, 246, 0.5)",
                        },
                        {
                          offset: 1,
                          color: "rgba(59, 130, 246, 0.05)",
                        },
                      ],
                    },
                  },
                  data: initialData,
                },
              ],
            }}
            onChartReady={(chart) => {
              chartRef = chart;
            }}
            id="gradient-line-chart"
          />
        );
      },
    },
    {
      title: "Interactive Bar Chart with Gradient",
      description: "Bar chart with gradient colors and zoom interaction",
      code: () => {
        const dataAxis = [
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "O",
          "P",
          "Q",
          "R",
          "S",
          "T",
        ];
        const data = [
          220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122,
          133, 334, 198, 123, 125, 220,
        ];

        let chartRef: any;

        return (
          <Chart
            variant="bar"
            option={{
              title: {
                text: "Click Bar to Zoom",
              },
              xAxis: {
                data: dataAxis,
                axisLabel: {
                  inside: true,
                },
                axisTick: {
                  show: false,
                },
                axisLine: {
                  show: false,
                },
                z: 10,
              },
              yAxis: {
                axisLine: {
                  show: false,
                },
                axisTick: {
                  show: false,
                },
              },
              dataZoom: [
                {
                  type: "inside",
                },
              ],
              series: [
                {
                  type: "bar",
                  showBackground: true,
                  backgroundStyle: {
                    color: "rgba(180, 180, 180, 0.2)",
                  },
                  data: data,
                },
              ],
            }}
            onChartReady={(chart) => {
              chartRef = chart;
              chart.on("click", (params: any) => {
                const zoomSize = 6;
                chart.dispatchAction({
                  type: "dataZoom",
                  startValue:
                    dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
                  endValue:
                    dataAxis[
                      Math.min(params.dataIndex + zoomSize / 2, data.length - 1)
                    ],
                });
              });
            }}
            id="interactive-bar-chart"
          />
        );
      },
    },
    {
      title: "Pie Chart",
      description: "A pie chart showing data distribution with theme colors",
      code: () => {
        return (
          <Chart
            variant="pie"
            option={{
              title: {
                text: "Market Share",
                left: "center",
              },
              tooltip: {
                trigger: "item",
                formatter: "{a} <br/>{b}: {c} ({d}%)",
              },
              legend: {
                orient: "vertical",
                left: "left",
              },
              series: [
                {
                  name: "Products",
                  type: "pie",
                  radius: "50%",
                  data: [
                    { value: 335, name: "Product A" },
                    { value: 310, name: "Product B" },
                    { value: 234, name: "Product C" },
                    { value: 135, name: "Product D" },
                    { value: 1548, name: "Product E" },
                  ],
                },
              ],
            }}
            id="pie-chart"
          />
        );
      },
    },
    {
      title: "Heatmap Chart",
      description: "Interactive heatmap with perlin noise data",
      code: () => {
        const generateHeatmapData = () => {
          const data: any[] = [];
          // Simple pseudo-random noise with smoothing for better visual appearance
          const random2D = (x: number, y: number) => {
            const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return hash - Math.floor(hash);
          };

          const smoothNoise = (x: number, y: number) => {
            const fracX = x - Math.floor(x);
            const fracY = y - Math.floor(y);

            const x1 = Math.floor(x);
            const y1 = Math.floor(y);
            const x2 = x1 + 1;
            const y2 = y1 + 1;

            // Interpolate between corner values
            const v1 = random2D(x1, y1);
            const v2 = random2D(x2, y1);
            const v3 = random2D(x1, y2);
            const v4 = random2D(x2, y2);

            const i1 = v1 * (1 - fracX) + v2 * fracX;
            const i2 = v3 * (1 - fracX) + v4 * fracX;

            return i1 * (1 - fracY) + i2 * fracY;
          };

          for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
              const value = smoothNoise(i * 0.15, j * 0.15);
              data.push([i, j, value]);
            }
          }
          return data;
        };

        return (
          <Chart
            variant="scatter"
            size="lg"
            option={{
              title: {
                text: "Heatmap Visualization",
              },
              tooltip: {
                position: "top",
              },
              grid: {
                height: "70%",
                top: "15%",
              },
              xAxis: {
                type: "category",
                data: Array.from({ length: 50 }, (_, i) => i.toString()),
                splitArea: {
                  show: true,
                },
              },
              yAxis: {
                type: "category",
                data: Array.from({ length: 50 }, (_, i) => i.toString()),
                splitArea: {
                  show: true,
                },
              },
              visualMap: {
                min: 0,
                max: 1,
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: "5%",
                inRange: {
                  color: [
                    "#313695",
                    "#4575b4",
                    "#74add1",
                    "#abd9e9",
                    "#e0f3f8",
                    "#ffffbf",
                    "#fee090",
                    "#fdae61",
                    "#f46d43",
                    "#d73027",
                    "#a50026",
                  ],
                },
              },
              series: [
                {
                  name: "Heatmap",
                  type: "heatmap",
                  data: generateHeatmapData(),
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                  },
                },
              ],
            }}
            id="heatmap-chart"
          />
        );
      },
    },
    {
      title: "Organization Tree Chart",
      description:
        "Hierarchical tree visualization of an organization structure",
      code: () => {
        return (
          <Chart
            size="lg"
            option={{
              tooltip: {
                trigger: "item",
                triggerOn: "mousemove",
              },
              series: [
                {
                  type: "tree",
                  data: [
                    {
                      name: "CEO",
                      children: [
                        {
                          name: "CTO",
                          children: [
                            {
                              name: "Engineering",
                              children: [
                                { name: "Frontend Team" },
                                { name: "Backend Team" },
                                { name: "DevOps Team" },
                              ],
                            },
                            {
                              name: "Product",
                              children: [
                                { name: "Design Team" },
                                { name: "Research Team" },
                              ],
                            },
                          ],
                        },
                        {
                          name: "CFO",
                          children: [
                            {
                              name: "Finance",
                              children: [
                                { name: "Accounting" },
                                { name: "Treasury" },
                              ],
                            },
                            {
                              name: "Legal",
                              children: [{ name: "Compliance" }],
                            },
                          ],
                        },
                        {
                          name: "CMO",
                          children: [
                            {
                              name: "Marketing",
                              children: [
                                { name: "Content Team" },
                                { name: "Social Media" },
                                { name: "SEO Team" },
                              ],
                            },
                            {
                              name: "Sales",
                              children: [
                                { name: "Enterprise Sales" },
                                { name: "SMB Sales" },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  top: "5%",
                  left: "7%",
                  bottom: "2%",
                  right: "20%",
                  symbolSize: 7,
                  label: {
                    position: "left",
                    verticalAlign: "middle",
                    align: "right",
                    fontSize: 12,
                  },
                  leaves: {
                    label: {
                      position: "right",
                      verticalAlign: "middle",
                      align: "left",
                    },
                  },
                  emphasis: {
                    focus: "descendant",
                  },
                  expandAndCollapse: true,
                  animationDuration: 550,
                  animationDurationUpdate: 750,
                },
              ],
            }}
            id="tree-chart"
          />
        );
      },
    },
  ],
};

export default Chart;
