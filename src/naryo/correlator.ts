import { PoolEvent } from "./listener";

export interface CorrelatedStory {
  id: string;
  events: PoolEvent[];
  tokenA: string;
  tokenB: string;
  sources: string[];
  totalAmountA: number;
  totalAmountB: number;
  priceImpact: number;
  startTimestamp: number;
  endTimestamp: number;
  confidence: "low" | "medium" | "high";
  triggerReason: string;
}

/**
 * Correlates events from multiple DLTs into a single "story"
 * for triggering the AI agent.
 *
 * Groups events by token pair within a time window.
 * Exceeding a volume threshold signals a trading opportunity.
 */
export class EventCorrelator {
  private buffer: PoolEvent[] = [];
  private readonly windowMs: number;
  private readonly volumeThreshold: number;

  constructor(windowMs = 30_000, volumeThreshold = 2) {
    this.windowMs = windowMs;
    this.volumeThreshold = volumeThreshold;
  }

  /**
   * Add a new event to the correlation buffer.
   * Returns a correlated story if a pattern is detected.
   */
  add(event: PoolEvent): CorrelatedStory | null {
    const now = Date.now();

    // Evict events outside the current window
    this.buffer = this.buffer.filter(
      (e) => now - e.timestamp < this.windowMs
    );

    this.buffer.push(event);

    // Group by token pair
    const groups = this.groupByPair();

    for (const [pair, events] of Object.entries(groups)) {
      if (events.length >= this.volumeThreshold) {
        const story = this.buildStory(pair, events);
        // Remove consumed events
        this.buffer = this.buffer.filter((e) => !events.includes(e));
        return story;
      }
    }

    return null;
  }

  private groupByPair(): Record<string, PoolEvent[]> {
    const groups: Record<string, PoolEvent[]> = {};
    for (const evt of this.buffer) {
      const key = this.pairKey(evt.tokenA, evt.tokenB);
      if (!groups[key]) groups[key] = [];
      groups[key].push(evt);
    }
    return groups;
  }

  private pairKey(a: string, b: string): string {
    return [a, b].sort().join("/");
  }

  private buildStory(pair: string, events: PoolEvent[]): CorrelatedStory {
    const [tokenA, tokenB] = pair.split("/");
    const sources = [...new Set(events.map((e) => e.source))];
    const totalAmountA = events.reduce(
      (s, e) => s + parseFloat(e.amountA || "0"),
      0
    );
    const totalAmountB = events.reduce(
      (s, e) => s + parseFloat(e.amountB || "0"),
      0
    );
    const avgPriceImpact =
      events.reduce((s, e) => s + (e.priceImpact || 0), 0) / events.length;
    const timestamps = events.map((e) => e.timestamp);
    const confidence: CorrelatedStory["confidence"] =
      sources.length >= 2 ? "high" : events.length >= 3 ? "medium" : "low";

    return {
      id: `story-${Date.now()}`,
      events,
      tokenA,
      tokenB,
      sources,
      totalAmountA,
      totalAmountB,
      priceImpact: avgPriceImpact,
      startTimestamp: Math.min(...timestamps),
      endTimestamp: Math.max(...timestamps),
      confidence,
      triggerReason: `Detected ${events.length} correlated ${pair} pool events across [${sources.join(", ")}] within ${this.windowMs / 1000}s window`,
    };
  }
}
