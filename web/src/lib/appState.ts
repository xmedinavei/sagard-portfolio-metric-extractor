// Pure app-lifecycle decisions, extracted so they can be unit-tested without a DOM
// (the app uses a logic-only test posture). Keeping these out of App.tsx means the
// branch that decides "show the found-reports list vs. the grid on load" is guarded by
// a test, not only by typecheck + a manual demo.

import type { MetricsExport } from "../types";

// Cold start: if the server already has a cached export (a run happened earlier this
// process) we open straight on the grid; otherwise we open on the idle prompt + the
// found-reports list shown BEFORE any processing (success criterion #7).
export function initialStatus(cachedExport: MetricsExport | null): "loaded" | "idle" {
  return cachedExport ? "loaded" : "idle";
}
