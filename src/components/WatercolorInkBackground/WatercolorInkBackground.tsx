"use client";

import { MeshGradient } from "@blur-ui/mesh-gradient";

export function WatercolorInkBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <MeshGradient
        colors={{
          color1: "#a86b76",
          color2: "#7d4f72",
          color3: "#b78a2e",
          color4: "#f4dde7",
        }}
        animationDuration={1400}
        opacity={0.6}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          filter: "blur(10px) saturate(118%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `
            radial-gradient(16rem 14rem at 12% 18%, rgb(168 107 118 / 45%), transparent 72%),
            radial-gradient(20rem 18rem at 88% 20%, rgb(125 79 114 / 42%), transparent 74%),
            radial-gradient(18rem 15rem at 24% 84%, rgb(183 138 46 / 26%), transparent 70%),
            radial-gradient(17rem 13rem at 76% 80%, rgb(125 79 114 / 32%), transparent 72%)
          `,
          mixBlendMode: "multiply",
          opacity: 0.62,
        }}
      />
    </div>
  );
}

