export async function register() {
  // Only load the scheduler code on the Node.js server side runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initWorkflowScheduler } = await import("@/lib/startup");
    await initWorkflowScheduler();
  }
}
