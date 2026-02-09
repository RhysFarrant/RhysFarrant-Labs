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
const LoginTestLab = lazy(() => import("@/labs/login-test"));

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
    slug: "login-test",
    name: "Login Test",
    description: "Client-side auth form prototype for validation and UX flows.",
    status: "WIP",
    stack: ["React 18", "TypeScript", "Forms"],
    lastUpdated: "2026-02-09",
    component: LoginTestLab,
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
