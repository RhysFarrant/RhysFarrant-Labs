import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Button from "@/components/ui/Button";

type PaletteKey = "meadow" | "clay" | "coastal" | "botanical-night";
type TextureMode = "soft-grain" | "linen" | "fiber" | "contour";
type MotifMode = "none" | "corner-leaves" | "vine-band" | "scatter";
type LeafArtworkId = "monstera" | "oak" | "linden" | "chestnut" | "falling";
type CopyState = "idle" | "copied" | "failed";

type Palette = {
  label: string;
  hue: number;
  saturation: number;
  lightness: number;
  accentHue: number;
  accentSaturation: number;
  accentLightness: number;
  shadowHue: number;
};

type AccentProfile = {
  label: string;
  accentHue: number;
  accentSat: number;
  darkLight: number;
  lightLight: number;
  headingShift: number;
  woodHue: number;
  woodSat: number;
};

type LeafInstance = {
  id: string;
  x: number;
  y: number;
  rotate: number;
  size: number;
  flip: boolean;
};

type PreparedLeafSvg = {
  viewBox: string;
  inner: string;
};

const palettes: Record<PaletteKey, Palette> = {
  meadow: {
    label: "Meadow Morning",
    hue: 98,
    saturation: 29,
    lightness: 68,
    accentHue: 126,
    accentSaturation: 38,
    accentLightness: 43,
    shadowHue: 115,
  },
  clay: {
    label: "Clay Workshop",
    hue: 27,
    saturation: 38,
    lightness: 73,
    accentHue: 93,
    accentSaturation: 35,
    accentLightness: 39,
    shadowHue: 20,
  },
  coastal: {
    label: "Coastal Garden",
    hue: 174,
    saturation: 28,
    lightness: 69,
    accentHue: 145,
    accentSaturation: 37,
    accentLightness: 40,
    shadowHue: 200,
  },
  "botanical-night": {
    label: "Botanical Night",
    hue: 151,
    saturation: 36,
    lightness: 19,
    accentHue: 132,
    accentSaturation: 34,
    accentLightness: 45,
    shadowHue: 158,
  },
};

const paletteOrder: PaletteKey[] = ["botanical-night", "meadow", "clay", "coastal"];

const accentProfiles: Record<PaletteKey, AccentProfile> = {
  "botanical-night": {
    label: "Walnut Bronze",
    accentHue: 31,
    accentSat: 40,
    darkLight: 44,
    lightLight: 36,
    headingShift: 2,
    woodHue: 26,
    woodSat: 48,
  },
  meadow: {
    label: "Moss Oak",
    accentHue: 93,
    accentSat: 45,
    darkLight: 54,
    lightLight: 39,
    headingShift: -5,
    woodHue: 40,
    woodSat: 42,
  },
  clay: {
    label: "Terracotta Cedar",
    accentHue: 18,
    accentSat: 62,
    darkLight: 52,
    lightLight: 40,
    headingShift: 3,
    woodHue: 20,
    woodSat: 48,
  },
  coastal: {
    label: "Driftwood Teal",
    accentHue: 186,
    accentSat: 46,
    darkLight: 55,
    lightLight: 40,
    headingShift: -2,
    woodHue: 34,
    woodSat: 34,
  },
};

const textureModes: Array<{ id: TextureMode; label: string; note: string }> = [
  { id: "soft-grain", label: "Soft Grain", note: "Powdery grain + subtle lines." },
  { id: "linen", label: "Linen Weave", note: "Crosshatch fabric-style texture." },
  { id: "fiber", label: "Fiber Drift", note: "Directional fibers and mist." },
  { id: "contour", label: "Contour Paper", note: "Topographic contour rings." },
];

const motifModes: Array<{ id: MotifMode; label: string; note: string }> = [
  { id: "none", label: "No Motif", note: "Background texture only." },
  { id: "corner-leaves", label: "Corner Leaves", note: "Leaf accents at frame edges." },
  { id: "vine-band", label: "Vine Band", note: "Rhythmic leaf border near base." },
  { id: "scatter", label: "Scatter", note: "Randomized leaves around edges." },
];

const leafArtworkOptions: Array<{ id: LeafArtworkId; label: string; file: string }> = [
  { id: "monstera", label: "Monstera", file: "monstera-leaf.svg" },
  { id: "oak", label: "Oak", file: "oak-leaf.svg" },
  { id: "linden", label: "Linden", file: "linden-leaf.svg" },
  { id: "chestnut", label: "Chestnut", file: "chestnut-leaf.svg" },
  { id: "falling", label: "Falling", file: "falling-leaf.svg" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function wrapHue(value: number): number {
  const wrapped = value % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function hslColor(h: number, s: number, l: number, a = 1): string {
  const hue = wrapHue(h).toFixed(1);
  const saturation = clamp(s, 0, 100).toFixed(1);
  const lightness = clamp(l, 0, 100).toFixed(1);
  const alpha = clamp(a, 0, 1).toFixed(3);
  return `hsl(${hue} ${saturation}% ${lightness}% / ${alpha})`;
}

function prepareLeafSvg(raw: string): PreparedLeafSvg | null {
  const parser = new DOMParser();
  const documentRoot = parser.parseFromString(raw, "image/svg+xml");
  const svg = documentRoot.querySelector("svg");
  if (!svg) return null;

  svg.querySelectorAll("path").forEach((pathNode) => {
    const fill = (pathNode.getAttribute("fill") ?? "").toLowerCase();
    const d = (pathNode.getAttribute("d") ?? "").replace(/\s+/g, "");
    if ((fill === "#000" || fill === "black") && d === "M00h512v512H0z") {
      pathNode.remove();
      return;
    }

    if (fill !== "none" && fill !== "") {
      pathNode.setAttribute("fill", "currentColor");
    }
  });

  svg.querySelectorAll("[fill]").forEach((node) => {
    const fill = node.getAttribute("fill");
    if (fill && fill !== "none") {
      node.setAttribute("fill", "currentColor");
    }
  });

  svg.querySelectorAll("[class],[style],[fill-opacity]").forEach((node) => {
    node.removeAttribute("class");
    node.removeAttribute("style");
    node.removeAttribute("fill-opacity");
  });

  const viewBox = svg.getAttribute("viewBox") ?? "0 0 512 512";
  return {
    viewBox,
    inner: svg.innerHTML,
  };
}

function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0;
  if (value === 0) value = 1;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildScatterLeaves(seed: number, count: number): LeafInstance[] {
  const next = createSeededRandom(seed);
  const leaves: LeafInstance[] = [];

  for (let index = 0; index < count; index += 1) {
    const side = Math.floor(next() * 4);
    let x = 8 + next() * 84;
    let y = 8 + next() * 84;
    let rotate = -20 + next() * 140;

    if (side === 0) {
      y = 4 + next() * 14;
      rotate = 35 + next() * 105;
    } else if (side === 1) {
      x = 84 + next() * 14;
      rotate = 105 + next() * 120;
    } else if (side === 2) {
      y = 84 + next() * 12;
      rotate = 200 + next() * 110;
    } else {
      x = 4 + next() * 14;
      rotate = -55 + next() * 120;
    }

    leaves.push({
      id: `scatter-${index}`,
      x,
      y,
      rotate,
      size: 0.62 + next() * 0.58,
      flip: next() > 0.5,
    });
  }

  return leaves;
}

function buildTextureLayers(
  mode: TextureMode,
  hue: number,
  saturation: number,
  lightness: number,
  textureFactor: number,
  grainFactor: number
): string[] {
  const softAlpha = 0.04 + textureFactor * 0.14;
  const lineAlpha = 0.05 + textureFactor * 0.16;
  const grainAlpha = 0.06 + grainFactor * 0.18;

  if (mode === "linen") {
    return [
      `repeating-linear-gradient(0deg,
        transparent 0px,
        transparent 3px,
        ${hslColor(hue + 8, saturation - 8, lightness + 8, lineAlpha)} 3px,
        ${hslColor(hue + 8, saturation - 8, lightness + 8, lineAlpha)} 4px
      )`,
      `repeating-linear-gradient(90deg,
        transparent 0px,
        transparent 3px,
        ${hslColor(hue - 10, saturation - 12, lightness - 10, lineAlpha * 0.82)} 3px,
        ${hslColor(hue - 10, saturation - 12, lightness - 10, lineAlpha * 0.82)} 4px
      )`,
      `repeating-radial-gradient(circle at 0% 0%,
        ${hslColor(hue + 3, saturation + 6, lightness + 8, grainAlpha * 0.72)} 0px,
        transparent 1.2px 4px
      )`,
    ];
  }

  if (mode === "fiber") {
    return [
      `repeating-linear-gradient(123deg,
        transparent 0px,
        transparent 7px,
        ${hslColor(hue - 6, saturation + 3, lightness - 4, lineAlpha)} 7px,
        ${hslColor(hue - 6, saturation + 3, lightness - 4, lineAlpha)} 8px
      )`,
      `repeating-linear-gradient(35deg,
        ${hslColor(hue + 12, saturation - 6, lightness + 11, softAlpha * 0.7)} 0px,
        ${hslColor(hue + 12, saturation - 6, lightness + 11, softAlpha * 0.7)} 1px,
        transparent 1px,
        transparent 5px
      )`,
      `repeating-radial-gradient(circle at 100% 100%,
        ${hslColor(hue + 10, saturation + 2, lightness + 7, grainAlpha * 0.66)} 0px,
        transparent 1.4px 4.2px
      )`,
    ];
  }

  if (mode === "contour") {
    return [
      `repeating-radial-gradient(circle at 78% 22%,
        transparent 0px,
        transparent 10px,
        ${hslColor(hue + 6, saturation - 12, lightness - 8, lineAlpha)} 10px,
        ${hslColor(hue + 6, saturation - 12, lightness - 8, lineAlpha)} 11px
      )`,
      `repeating-radial-gradient(circle at 18% 78%,
        transparent 0px,
        transparent 11px,
        ${hslColor(hue - 12, saturation - 16, lightness + 8, lineAlpha * 0.86)} 11px,
        ${hslColor(hue - 12, saturation - 16, lightness + 8, lineAlpha * 0.86)} 12px
      )`,
      `repeating-radial-gradient(circle at 0% 0%,
        ${hslColor(hue + 2, saturation + 4, lightness + 6, grainAlpha * 0.64)} 0px,
        transparent 1.3px 4px
      )`,
    ];
  }

  return [
    `repeating-radial-gradient(circle at 0% 0%,
      ${hslColor(hue + 4, saturation + 2, lightness + 10, grainAlpha)} 0px,
      transparent 1.4px 4.2px
    )`,
    `repeating-linear-gradient(135deg,
      transparent 0px,
      transparent 8px,
      ${hslColor(hue - 8, saturation - 10, lightness - 6, softAlpha)} 8px,
      ${hslColor(hue - 8, saturation - 10, lightness - 6, softAlpha)} 9px
    )`,
    `repeating-linear-gradient(35deg,
      transparent 0px,
      transparent 14px,
      ${hslColor(hue + 6, saturation - 6, lightness + 7, lineAlpha * 0.62)} 14px,
      ${hslColor(hue + 6, saturation - 6, lightness + 7, lineAlpha * 0.62)} 15px
    )`,
  ];
}

function renderLeafTransform(leaf: LeafInstance, leafScale: number): string {
  const scale = (leaf.size * leafScale) / 100;
  const parts = [
    "translate(-50%, -50%)",
    `rotate(${leaf.rotate.toFixed(1)}deg)`,
    `scale(${scale.toFixed(3)})`,
    leaf.flip ? "scaleX(-1)" : "",
  ];

  return parts.filter(Boolean).join(" ");
}

function LeafArtworkGlyph({
  style,
  preparedSvg,
}: {
  style: CSSProperties;
  preparedSvg: PreparedLeafSvg;
}) {
  return (
    <span className="absolute h-24 w-24" style={style} aria-hidden="true">
      <svg
        viewBox={preparedSvg.viewBox}
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        dangerouslySetInnerHTML={{ __html: preparedSvg.inner }}
      />
    </span>
  );
}

export default function OrganicDesignLab() {
  const [paletteKey, setPaletteKey] = useState<PaletteKey>("botanical-night");
  const [textureMode, setTextureMode] = useState<TextureMode>("soft-grain");
  const [motifMode, setMotifMode] = useState<MotifMode>("corner-leaves");
  const [depth, setDepth] = useState(58);
  const [textureStrength, setTextureStrength] = useState(62);
  const [grain, setGrain] = useState(44);
  const [leafScale, setLeafScale] = useState(108);
  const [leafOpacity, setLeafOpacity] = useState(54);
  const [leafHueShift, setLeafHueShift] = useState(0);
  const [leafArtworkIds, setLeafArtworkIds] = useState<LeafArtworkId[]>(["monstera", "falling"]);
  const [hazeEnabled, setHazeEnabled] = useState(true);
  const [seed, setSeed] = useState(20260217);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [preparedLeafSvgs, setPreparedLeafSvgs] = useState<Partial<Record<LeafArtworkId, PreparedLeafSvg>>>({});

  useEffect(() => {
    if (copyState === "idle") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1400);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  useEffect(() => {
    const missingIds = leafArtworkIds.filter((id) => !preparedLeafSvgs[id]);
    if (missingIds.length === 0) return;

    let isCancelled = false;
    for (const artworkId of missingIds) {
      const artwork = leafArtworkOptions.find((option) => option.id === artworkId);
      if (!artwork) continue;

      void fetch(`/leaves/${artwork.file}`)
        .then((response) => response.text())
        .then((raw) => {
          if (isCancelled) return;
          const prepared = prepareLeafSvg(raw);
          if (!prepared) return;
          setPreparedLeafSvgs((current) => ({
            ...current,
            [artworkId]: prepared,
          }));
        })
        .catch(() => {
          // Keep existing fallback behavior if asset parsing fails.
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [leafArtworkIds, preparedLeafSvgs]);

  const palette = palettes[paletteKey];
  const depthFactor = depth / 100;
  const textureFactor = textureStrength / 100;
  const grainFactor = grain / 100;
  const sceneHue = wrapHue(palette.hue + depthFactor * 4);
  const sceneSaturation = palette.saturation + depthFactor * 8;
  const sceneLightness = palette.lightness - depthFactor * 10;
  const leafHue = wrapHue(palette.accentHue + leafHueShift);
  const isDarkScene = sceneLightness < 40;
  const isBotanicalNight = paletteKey === "botanical-night";
  const accentProfile = accentProfiles[paletteKey];
  const accentHue = wrapHue(accentProfile.accentHue + depthFactor * 3);
  const woodHue = accentProfile.woodHue;
  const woodSat = accentProfile.woodSat;

  const backgroundBase = hslColor(sceneHue - 8, sceneSaturation - 10, sceneLightness - 11);
  const backgroundLayers = useMemo(() => {
    const atmosphereLayers = [
      `radial-gradient(145% 110% at -2% -10%,
        ${hslColor(leafHue, palette.accentSaturation + 4, palette.accentLightness + 8, 0.42)} 0%,
        transparent 52%
      )`,
      `radial-gradient(120% 95% at 100% 0%,
        ${hslColor(sceneHue + 24, sceneSaturation + 4, sceneLightness + 20, 0.28)} 0%,
        transparent 56%
      )`,
      `linear-gradient(156deg,
        ${hslColor(sceneHue + 2, sceneSaturation + 4, sceneLightness + 15, 0.92)} 0%,
        ${hslColor(sceneHue - 8, sceneSaturation - 4, sceneLightness + 1, 0.92)} 48%,
        ${hslColor(sceneHue - 16, sceneSaturation - 6, sceneLightness - 18, 0.93)} 100%
      )`,
    ];

    return [
      ...atmosphereLayers,
      ...buildTextureLayers(
        textureMode,
        sceneHue,
        sceneSaturation,
        sceneLightness,
        textureFactor,
        grainFactor
      ),
    ];
  }, [
    grainFactor,
    leafHue,
    palette.accentLightness,
    palette.accentSaturation,
    sceneHue,
    sceneLightness,
    sceneSaturation,
    textureFactor,
    textureMode,
  ]);

  const leafInstances = useMemo(() => {
    if (motifMode === "none") return [];

    if (motifMode === "corner-leaves") {
      return [
        { id: "corner-1", x: 7, y: 8, rotate: 34, size: 0.96, flip: false },
        { id: "corner-2", x: 14, y: 15, rotate: 54, size: 0.72, flip: false },
        { id: "corner-3", x: 92, y: 8, rotate: 142, size: 0.98, flip: true },
        { id: "corner-4", x: 85, y: 15, rotate: 120, size: 0.66, flip: true },
        { id: "corner-5", x: 7, y: 89, rotate: -36, size: 0.92, flip: true },
        { id: "corner-6", x: 14, y: 82, rotate: -18, size: 0.64, flip: true },
        { id: "corner-7", x: 93, y: 90, rotate: 202, size: 0.88, flip: false },
        { id: "corner-8", x: 86, y: 83, rotate: 184, size: 0.62, flip: false },
      ];
    }

    if (motifMode === "vine-band") {
      return Array.from({ length: 10 }, (_, index) => ({
        id: `vine-${index}`,
        x: 6 + index * 9.7,
        y: 86 + (index % 2 === 0 ? 0 : 5),
        rotate: index % 2 === 0 ? 302 : 248,
        size: 0.54 + (index % 3) * 0.09,
        flip: index % 2 === 0,
      }));
    }

    return buildScatterLeaves(seed, 12);
  }, [motifMode, seed]);
  const selectedLeafSvgs = leafArtworkIds
    .map((id) => ({ id, svg: preparedLeafSvgs[id] }))
    .filter((entry): entry is { id: LeafArtworkId; svg: PreparedLeafSvg } => Boolean(entry.svg));

  function toggleLeafArtwork(artworkId: LeafArtworkId) {
    setLeafArtworkIds((current) => {
      if (current.includes(artworkId)) {
        if (current.length === 1) return current;
        return current.filter((id) => id !== artworkId);
      }

      if (current.length < 2) {
        return [...current, artworkId];
      }

      return [current[1], artworkId];
    });
  }

  const textPrimary = isDarkScene
    ? isBotanicalNight
      ? "hsl(48 24% 95%)"
      : "hsl(0 0% 96%)"
    : "hsl(210 28% 16%)";
  const textMuted = isDarkScene
    ? isBotanicalNight
      ? "hsl(45 20% 83% / 0.78)"
      : "hsl(0 0% 86% / 0.76)"
    : "hsl(210 20% 28% / 0.84)";
  const accentColor = hslColor(
    accentHue,
    accentProfile.accentSat,
    isDarkScene ? accentProfile.darkLight : accentProfile.lightLight
  );
  const accentBorder = hslColor(
    accentHue + 2,
    accentProfile.accentSat - 14,
    isDarkScene ? accentProfile.darkLight - 8 : accentProfile.lightLight - 4,
    0.86
  );
  const accentSoft = hslColor(
    accentHue - 2,
    accentProfile.accentSat - 10,
    isDarkScene ? accentProfile.darkLight - 28 : accentProfile.lightLight - 10,
    0.36
  );
  const accentGlow = hslColor(
    accentHue + 4,
    accentProfile.accentSat - 4,
    isDarkScene ? accentProfile.darkLight - 14 : accentProfile.lightLight - 8,
    0.24
  );
  const accentLine = hslColor(
    accentHue + 1,
    accentProfile.accentSat + 4,
    isDarkScene ? accentProfile.darkLight + 9 : accentProfile.lightLight + 9,
    0.68
  );
  const accentCardBorder = hslColor(
    accentHue + 2,
    accentProfile.accentSat - 10,
    isDarkScene ? accentProfile.darkLight - 4 : accentProfile.lightLight + 2,
    0.52
  );
  const accentCardBg = hslColor(
    accentHue - 1,
    accentProfile.accentSat - 16,
    isDarkScene ? accentProfile.darkLight - 28 : accentProfile.lightLight + 19,
    0.22
  );
  const accentButtonBg = isBotanicalNight
    ? hslColor(27, 44, 24)
    : hslColor(
        accentHue,
        accentProfile.accentSat + 2,
        isDarkScene ? accentProfile.darkLight + 2 : accentProfile.lightLight - 2
      );
  const accentButtonBorder = isBotanicalNight
    ? hslColor(30, 40, 38, 0.85)
    : hslColor(accentHue + 2, accentProfile.accentSat - 12, isDarkScene ? accentProfile.darkLight - 6 : accentProfile.lightLight - 3, 0.72);
  const accentButtonText = isBotanicalNight
    ? "hsl(43 26% 89%)"
    : isDarkScene
      ? hslColor(accentHue + 14, 44, 12)
      : "hsl(0 0% 98%)";
  const sectionHeadingColor = hslColor(
    accentHue + accentProfile.headingShift,
    accentProfile.accentSat + 2,
    isDarkScene ? accentProfile.darkLight + 6 : accentProfile.lightLight + 7
  );
  const surfaceBg = isDarkScene
    ? isBotanicalNight
      ? hslColor(sceneHue + 2, sceneSaturation + 10, sceneLightness + 2, 0.6)
      : hslColor(sceneHue + 4, sceneSaturation + 8, sceneLightness + 1, 0.56)
    : hslColor(sceneHue + 10, sceneSaturation + 5, sceneLightness + 19, 0.55);
  const surfaceBorder = isDarkScene
    ? isBotanicalNight
      ? hslColor(accentHue + 2, 28, 49, 0.44)
      : hslColor(sceneHue + 18, sceneSaturation + 4, sceneLightness + 20, 0.36)
    : hslColor(sceneHue - 12, sceneSaturation - 16, sceneLightness - 20, 0.32);
  const leafColor = hslColor(
    leafHue,
    palette.accentSaturation + (isBotanicalNight ? 6 : 10),
    palette.accentLightness + (isDarkScene ? (isBotanicalNight ? 1 : 4) : -2)
  );
  const leafShadow = hslColor(palette.shadowHue, 28, 18, isDarkScene ? 0.43 : 0.24);
  const highlightSwatches = useMemo(() => {
    const families = [
      { label: "Red", hue: 4 },
      { label: "Orange", hue: 26 },
      { label: "Yellow", hue: 48 },
      { label: "Lime", hue: 78 },
      { label: "Green", hue: 124 },
      { label: "Teal", hue: 170 },
      { label: "Blue", hue: 212 },
      { label: "Indigo", hue: 242 },
      { label: "Violet", hue: 276 },
      { label: "Magenta", hue: 326 },
    ];
    const hueShift = (sceneHue - 160) * 0.08;
    const saturation = isDarkScene ? 52 : 46;
    const lightness = isDarkScene ? 74 : 67;

    return families.map((family, index) => ({
      ...family,
      color: hslColor(
        family.hue + hueShift,
        saturation + (index % 2 === 0 ? 3 : -3),
        lightness + ((index % 3) - 1) * 1.5
      ),
    }));
  }, [isDarkScene, sceneHue]);
  const woodBase = hslColor(woodHue, woodSat, 10);
  const woodBorder = hslColor(woodHue + 5, woodSat - 7, 24, 0.78);
  const woodLayers = [
    `linear-gradient(162deg,
      ${hslColor(woodHue + 7, woodSat + 13, 29)} 0%,
      ${hslColor(woodHue + 1, woodSat + 3, 14)} 54%,
      ${hslColor(woodHue - 1, woodSat - 5, 8)} 100%
    )`,
    `repeating-linear-gradient(10deg,
      ${hslColor(woodHue + 8, woodSat + 7, 30, 0.23)} 0px,
      ${hslColor(woodHue + 8, woodSat + 7, 30, 0.23)} 2px,
      ${hslColor(woodHue - 4, woodSat - 3, 10, 0.28)} 2px,
      ${hslColor(woodHue - 4, woodSat - 3, 10, 0.28)} 7px
    )`,
    `repeating-linear-gradient(94deg,
      transparent 0px,
      transparent 11px,
      ${hslColor(woodHue - 5, woodSat - 10, 7, 0.28)} 11px,
      ${hslColor(woodHue - 5, woodSat - 10, 7, 0.28)} 16px
    )`,
    `repeating-radial-gradient(circle at 26% 48%,
      ${hslColor(woodHue + 9, woodSat + 3, 26, 0.18)} 0px,
      ${hslColor(woodHue + 9, woodSat + 3, 26, 0.18)} 2px,
      transparent 2px,
      transparent 18px
    )`,
    `radial-gradient(170% 90% at 50% 0%, ${accentGlow} 0%, transparent 62%)`,
  ];
  const cssRecipe = useMemo(
    () => `.organic-panel {
  background-color: ${backgroundBase};
  background-image:
    ${backgroundLayers.join(",\n    ")};
  border-radius: 28px;
}

.organic-leaf {
  color: ${leafColor};
  opacity: ${(leafOpacity / 100).toFixed(2)};
}`,
    [backgroundBase, backgroundLayers, leafColor, leafOpacity]
  );

  async function copyRecipe() {
    try {
      await navigator.clipboard.writeText(cssRecipe);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold">Organic Design Elements Lab</h2>
        <p className="max-w-3xl text-sm text-text-secondary">
          Explore non-flat textured backgrounds and leaf motifs. Tune material depth, grain, and motif style,
          then copy the generated CSS recipe for use in production comps.
        </p>
        <div
          className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em]"
          style={{ borderColor: accentBorder, backgroundColor: accentSoft, color: accentColor }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 0 4px ${accentGlow}` }}
          />
          Accent: {accentProfile.label}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <section className="space-y-4 rounded-xl border border-border bg-bg/35 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.13em]" style={{ color: sectionHeadingColor }}>
              Palette
            </p>
            <div className="mt-2 grid gap-2">
              {paletteOrder.map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setPaletteKey(key)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    paletteKey === key
                      ? "text-text-primary"
                      : "border-border bg-surface/50 text-text-secondary hover:text-text-primary"
                  }`}
                  style={
                    paletteKey === key
                      ? { borderColor: accentBorder, backgroundColor: accentSoft, boxShadow: `inset 0 0 0 1px ${accentGlow}` }
                      : undefined
                  }
                >
                  <p className="text-sm font-medium">{palettes[key].label}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    H{Math.round(palettes[key].hue)} S{Math.round(palettes[key].saturation)} L
                    {Math.round(palettes[key].lightness)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.13em]" style={{ color: sectionHeadingColor }}>
              Texture
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {textureModes.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setTextureMode(mode.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    textureMode === mode.id
                      ? "text-text-primary"
                      : "border-border bg-surface/50 text-text-secondary hover:text-text-primary"
                  }`}
                  style={
                    textureMode === mode.id
                      ? { borderColor: accentBorder, backgroundColor: accentSoft, boxShadow: `inset 0 0 0 1px ${accentGlow}` }
                      : undefined
                  }
                >
                  <p className="text-xs font-medium uppercase tracking-[0.1em]">{mode.label}</p>
                  <p className="mt-1 text-[11px] text-text-muted">{mode.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.13em]" style={{ color: sectionHeadingColor }}>
              Leaf Motif
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {motifModes.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  onClick={() => setMotifMode(mode.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    motifMode === mode.id
                      ? "text-text-primary"
                      : "border-border bg-surface/50 text-text-secondary hover:text-text-primary"
                  }`}
                  style={
                    motifMode === mode.id
                      ? { borderColor: accentBorder, backgroundColor: accentSoft, boxShadow: `inset 0 0 0 1px ${accentGlow}` }
                      : undefined
                  }
                >
                  <p className="text-xs font-medium uppercase tracking-[0.1em]">{mode.label}</p>
                  <p className="mt-1 text-[11px] text-text-muted">{mode.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.13em]" style={{ color: sectionHeadingColor }}>
              Leaf Artwork
            </p>
            <p className="mt-1 text-[11px] text-text-muted">Pick up to 2 artworks.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {leafArtworkOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => toggleLeafArtwork(option.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    leafArtworkIds.includes(option.id)
                      ? "text-text-primary"
                      : "border-border bg-surface/50 text-text-secondary hover:text-text-primary"
                  }`}
                  style={
                    leafArtworkIds.includes(option.id)
                      ? {
                          borderColor: accentBorder,
                          backgroundColor: accentSoft,
                          boxShadow: `inset 0 0 0 1px ${accentGlow}`,
                        }
                      : undefined
                  }
                >
                  <p className="text-xs font-medium uppercase tracking-[0.1em]">{option.label}</p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {option.file}
                    {leafArtworkIds.includes(option.id)
                      ? ` | Slot ${leafArtworkIds.indexOf(option.id) + 1}`
                      : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border/80 bg-surface/40 p-3">
            <label className="block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Material Depth</span>
                <span className="text-text-muted">{depth}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={depth}
                onChange={(event) => setDepth(Number(event.target.value))}
                className="w-full accent-accent"
                style={{ accentColor: accentColor }}
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Texture Strength</span>
                <span className="text-text-muted">{textureStrength}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={textureStrength}
                onChange={(event) => setTextureStrength(Number(event.target.value))}
                className="w-full accent-accent"
                style={{ accentColor: accentColor }}
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Grain</span>
                <span className="text-text-muted">{grain}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={grain}
                onChange={(event) => setGrain(Number(event.target.value))}
                className="w-full accent-accent"
                style={{ accentColor: accentColor }}
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Leaf Scale</span>
                <span className="text-text-muted">{leafScale}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={170}
                value={leafScale}
                onChange={(event) => setLeafScale(Number(event.target.value))}
                className="w-full accent-accent"
                style={{ accentColor: accentColor }}
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Leaf Opacity</span>
                <span className="text-text-muted">{leafOpacity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                value={leafOpacity}
                onChange={(event) => setLeafOpacity(Number(event.target.value))}
                className="w-full accent-accent"
                style={{ accentColor: accentColor }}
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Leaf Hue Shift</span>
                <span className="text-text-muted">{leafHueShift}</span>
              </div>
              <input
                type="range"
                min={-70}
                max={70}
                value={leafHueShift}
                onChange={(event) => setLeafHueShift(Number(event.target.value))}
                className="w-full accent-accent"
                style={{ accentColor: accentColor }}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setHazeEnabled((current) => !current)}>
              {hazeEnabled ? "Disable Haze" : "Enable Haze"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSeed((current) => current + 113)}
              disabled={motifMode !== "scatter"}
            >
              Re-seed Scatter
            </Button>
          </div>
        </section>

        <div className="space-y-4">
          <div
            className="rounded-[34px] border p-[10px]"
            style={{
              backgroundColor: woodBase,
              backgroundImage: woodLayers.join(","),
              borderColor: woodBorder,
              boxShadow: `0 24px 54px -30px ${hslColor(18, 40, 8, 0.75)}`,
            }}
          >
            <section
              className="relative min-h-[500px] overflow-hidden rounded-[24px] border p-6 sm:p-8"
              style={{
                backgroundColor: backgroundBase,
                backgroundImage: backgroundLayers.join(","),
                borderColor: surfaceBorder,
                boxShadow: `0 26px 60px -35px ${hslColor(palette.shadowHue, 30, 12, isDarkScene ? 0.66 : 0.24)}`,
              }}
            >
            {hazeEnabled ? (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(120% 65% at 50% 100%, ${hslColor(sceneHue, 26, 18, isDarkScene ? 0.34 : 0.2)} 0%, transparent 74%)`,
                }}
              />
            ) : null}

            <div
              className="pointer-events-none absolute left-8 right-8 top-5 h-[2px] rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${accentLine} 20%, ${accentColor} 50%, ${accentLine} 80%, transparent 100%)`,
              }}
            />

            <div className="pointer-events-none absolute inset-0">
              {leafInstances.map((leaf, index) => (
                selectedLeafSvgs.length > 0 ? (
                  <LeafArtworkGlyph
                    key={leaf.id}
                    preparedSvg={selectedLeafSvgs[index % selectedLeafSvgs.length].svg}
                    style={{
                      left: `${leaf.x.toFixed(2)}%`,
                      top: `${leaf.y.toFixed(2)}%`,
                      transform: renderLeafTransform(leaf, leafScale),
                      color: leafColor,
                      opacity: leafOpacity / 100,
                      filter: `drop-shadow(0 8px 14px ${leafShadow})`,
                    }}
                  />
                ) : null
              ))}
            </div>

            <div className="relative z-10 mx-auto flex max-w-xl flex-col gap-4">
              <div
                className="inline-flex w-fit rounded-full border px-3 py-1 text-xs uppercase tracking-[0.13em]"
                style={{
                  backgroundColor: accentSoft,
                  color: accentColor,
                  borderColor: accentBorder,
                  boxShadow: `0 8px 22px -16px ${accentGlow}`,
                }}
              >
                Texture Preview
              </div>

              <h3 className="max-w-lg text-3xl font-semibold leading-tight sm:text-4xl" style={{ color: textPrimary }}>
                Botanical layout with tactile, layered depth.
              </h3>

              <p className="max-w-lg text-sm sm:text-base" style={{ color: textMuted }}>
                This scene combines atmospheric gradients, controlled texture overlays, and reusable leaf motifs.
                Use the controls to evaluate how much visual richness you want before final UI composition.
              </p>

              <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: accentColor }}>
                Accent Focus: {accentProfile.label}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{
                    background: isBotanicalNight
                      ? `linear-gradient(180deg, ${hslColor(30, 46, 30)} 0%, ${accentButtonBg} 100%)`
                      : accentButtonBg,
                    borderColor: accentButtonBorder,
                    color: accentButtonText,
                    boxShadow: `0 10px 20px -16px ${accentGlow}`,
                  }}
                >
                  Apply Accent
                </button>
                <button
                  type="button"
                  className="rounded-full border px-4 py-2 text-xs font-medium"
                  style={{
                    borderColor: accentBorder,
                    backgroundColor: accentSoft,
                    color: accentColor,
                  }}
                >
                  Tune Motifs
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <article
                  className="rounded-2xl border p-4 backdrop-blur-[2px]"
                  style={{
                    backgroundColor: surfaceBg,
                    backgroundImage: `linear-gradient(145deg, ${accentCardBg} 0%, transparent 54%)`,
                    borderColor: accentCardBorder,
                    color: textPrimary,
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.11em]" style={{ color: accentColor }}>
                    Material Card
                  </p>
                  <p className="mt-2 text-lg font-semibold">Textured Hero Panel</p>
                  <p className="mt-1 text-sm" style={{ color: textMuted }}>
                    Elevates plain gradients by layering weave + grain detail.
                  </p>
                </article>

                <article
                  className="rounded-2xl border p-4 backdrop-blur-[2px]"
                  style={{
                    backgroundColor: surfaceBg,
                    backgroundImage: `linear-gradient(145deg, ${accentCardBg} 0%, transparent 62%)`,
                    borderColor: accentCardBorder,
                    color: textPrimary,
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.11em]" style={{ color: accentColor }}>
                    Motif Card
                  </p>
                  <p className="mt-2 text-lg font-semibold">Monstera Accent System</p>
                  <p className="mt-1 text-sm" style={{ color: textMuted }}>
                    Rounded monstera leaves across corner, border, and scatter arrangements.
                  </p>
                </article>
              </div>

              <section
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: surfaceBg,
                  borderColor: accentCardBorder,
                }}
              >
                <p className="text-center text-xs uppercase tracking-[0.11em]" style={{ color: accentColor }}>
                  Highlight Test Colors
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {highlightSwatches.map((swatch) => (
                    <span
                      key={swatch.label}
                      title={swatch.label}
                      className="h-8 w-8 rounded-full border"
                      style={{
                        backgroundColor: swatch.color,
                        borderColor: hslColor(sceneHue + 8, 18, isDarkScene ? 76 : 34, 0.56),
                        boxShadow: `0 7px 12px -8px ${hslColor(palette.shadowHue, 28, 8, 0.56)}`,
                      }}
                    />
                  ))}
                </div>
              </section>
            </div>
            </section>
          </div>

          <section className="rounded-xl border border-border bg-bg/35 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.13em]" style={{ color: sectionHeadingColor }}>
                Generated CSS Recipe
              </p>
              <Button variant="ghost" onClick={copyRecipe}>
                {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy CSS"}
              </Button>
            </div>
            <pre className="max-h-60 overflow-auto rounded-lg border border-border/80 bg-bg/50 p-3 text-[11px] leading-relaxed text-text-secondary">
              <code>{cssRecipe}</code>
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
