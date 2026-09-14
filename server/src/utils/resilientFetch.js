import { Agent } from "undici";

// Configure dedicated Undici agent with 30s connect timeout to handle Neon compute wake-ups
export const neonAgent = new Agent({
  connect: {
    timeout: 30000,
  },
  pipelining: 1,
});

/**
 * Resilient fetch wrapper with exponential backoff for Neon serverless HTTP.
 * Automatically handles transient TLS socket terminations (UND_ERR_SOCKET),
 * Neon compute wake-up timeouts (ConnectTimeoutError), and transient fetch drops.
 */
export async function resilientNeonFetch(endpoint, options = {}, maxRetries = 6) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const timeoutSignal = AbortSignal.timeout(60000);
      const combinedSignal = options.signal
        ? AbortSignal.any([options.signal, timeoutSignal])
        : timeoutSignal;

      return await fetch(endpoint, {
        dispatcher: neonAgent,
        ...options,
        signal: combinedSignal,
      });
    } catch (err) {
      if (attempt < maxRetries - 1) {
        const backoffMs = 400 * Math.pow(2, attempt);
        console.warn(`[Neon Retry] Transient network glitch (attempt ${attempt + 1}/${maxRetries}): ${err?.message || err}. Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
      throw err;
    }
  }
}
