import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type LabStatus = "WIP" | "Stable" | "Archived";

type LabComponent = ComponentType | LazyExoticComponent<ComponentType>;

export type LabDef = {
  slug: string;
  name: string;
  description: string;
  status: LabStatus;
  stack: string[];
  lastUpdated: string;
  component: LabComponent;
};

const CalculatorLab = lazy(() => import("@/labs/calculator"));
const DiceRollerLab = lazy(() => import("@/labs/dice-roller"));
const FeatureFlagSimulatorLab = lazy(() => import("@/labs/feature-flag-simulator"));
const LoginTestLab = lazy(() => import("@/labs/login-test"));
const MicroAnimationPlaygroundLab = lazy(() => import("@/labs/micro-animation-playground"));
const ThemeTestingLab = lazy(() => import("@/labs/theme-testing"));
const TimersLab = lazy(() => import("@/labs/timers"));
const WheelSpinnerLab = lazy(() => import("@/labs/wheel-spinner"));

export const labs: LabDef[] = [
  {
    slug: "calculator",
    name: "Calculator",
    description: "Quick arithmetic sandbox for tiny interaction checks.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "Tailwind"],
    lastUpdated: "2026-02-09",
    component: CalculatorLab,
  },
  {
    slug: "dice-roller",
    name: "Dice Roller",
    description: "Pick any die and simulate random rolls.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "Random"],
    lastUpdated: "2026-02-10",
    component: DiceRollerLab,
  },
  {
    slug: "feature-flag-simulator",
    name: "Feature Flag Simulator",
    description: "Environment and segment based flag sandbox with real-time UI behavior preview.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "State Modelling"],
    lastUpdated: "2026-02-10",
    component: FeatureFlagSimulatorLab,
  },
  {
    slug: "login-test",
    name: "Login Test",
    description: "Client-side auth form prototype for validation and UX flows.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "Forms"],
    lastUpdated: "2026-02-10",
    component: LoginTestLab,
  },
  {
    slug: "micro-animation-playground",
    name: "Micro-Animation Playground",
    description: "Small interaction tests for hover, press, and success/failure feedback.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "Animation"],
    lastUpdated: "2026-01-28",
    component: MicroAnimationPlaygroundLab,
  },
  {
    slug: "theme-testing",
    name: "Theme Testing",
    description: "Light and dark palette sandbox with a live mock site preview.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "Theming"],
    lastUpdated: "2026-01-03",
    component: ThemeTestingLab,
  },
  {
    slug: "timers",
    name: "Timers",
    description: "Count up timer, custom countdown, and Pomodoro work/break cycles.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "Timers"],
    lastUpdated: "2026-02-10",
    component: TimersLab,
  },
  {
    slug: "wheel-spinner",
    name: "Wheel Spinner",
    description: "Animated prize-wheel style random selector.",
    status: "Stable",
    stack: ["React 18", "TypeScript", "Animation"],
    lastUpdated: "2026-02-10",
    component: WheelSpinnerLab,
  },
];

function assertUniqueSlugs(defs: LabDef[]): void {
  const seen = new Set<string>();
  for (const def of defs) {
    if (seen.has(def.slug)) {
      throw new Error(`Duplicate lab slug found: ${def.slug}`);
    }
    seen.add(def.slug);
  }
}

assertUniqueSlugs(labs);
