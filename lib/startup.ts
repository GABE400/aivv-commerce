import { workflowEngine } from "./workflow-engine";

export async function initWorkflowScheduler() {
  // Only execute in Node.js server-side environment
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const globalSymbol = Symbol.for("aivv.workflowScheduler.initialized");
    const globalObject = globalThis as any;

    if (!globalObject[globalSymbol]) {
      globalObject[globalSymbol] = true;
      console.log("[Startup] Initializing workflow engine globally...");
      await workflowEngine.initialize();
    } else {
      console.log("[Startup] Workflow engine already initialized globally. Skipping.");
    }
  }
}
