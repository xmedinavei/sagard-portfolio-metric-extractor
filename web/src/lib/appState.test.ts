import { describe, expect, it } from "vitest";

import type { MetricsExport } from "../types";
import { initialStatus } from "./appState";

describe("initialStatus (cold-start gate)", () => {
  it("opens on the idle prompt + reports list when there is no cached export", () => {
    // This is what makes success criterion #7 hold: a fresh server (no prior run)
    // shows the found-reports list BEFORE any processing.
    expect(initialStatus(null)).toBe("idle");
  });

  it("opens on the loaded grid when a cached export already exists", () => {
    const cached = { export_metadata: {}, metrics: [], issues: [] } as unknown as MetricsExport;
    expect(initialStatus(cached)).toBe("loaded");
  });
});
