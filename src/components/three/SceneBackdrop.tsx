import { Component, ReactNode, Suspense, lazy, useMemo } from "react";
import type { MailUniverseVariant } from "./MailUniverse";

const MailUniverse = lazy(() => import("./MailUniverse"));

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D scene disabled:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Full-bleed 3D backdrop. Sits absolutely inside its (relative) parent,
 * behind the UI. Falls back to the CSS gradient if WebGL is unavailable.
 */
export default function SceneBackdrop({ variant = "hero", envelopes = true }: { variant?: MailUniverseVariant; envelopes?: boolean }) {
  const webgl = useMemo(hasWebGL, []);
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        background:
          "#f5f1ea",
      }}
    >
      {webgl && (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <div style={{ position: "absolute", inset: 0, animation: "scene-fade-in 1.2s ease-out both" }}>
              <MailUniverse variant={variant} envelopes={envelopes} />
            </div>
          </Suspense>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
