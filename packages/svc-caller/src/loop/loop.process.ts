import { Queue } from "./loop.queue";
import { Logger } from "@nestjs/common";

export class Loop {

  private readonly listeners: Set<string> = new Set();
	
	readonly queue: Queue;
	
  private busySlots = 0;

	constructor (
		name: string,
    private readonly maxSlots: number
	) {
		this.queue = new Queue(name);
	}

  fn: (q: Queue) => Promise<void>;

  init = async () => {
    await this.queue.init();
  }

  private readonly runLoop = () => {
    if (!this.listeners.size) return;
    for (let n = 0; n < this.maxSlots - this.busySlots; n++) {
      process.nextTick(this.next);
    }
  }

  private timeout: NodeJS.Timeout;

  private debouncedRunLoop = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.runLoop, 1000);
  }

  private readonly next = async () => {
    let resolved = false;
    this.busySlots += 1;

    const resolve = () => {
      if (resolved) return;

      this.busySlots -= 1;
      resolved = true;
      this.debouncedRunLoop();
    }

    const timeout = setTimeout(() => {
      Logger.error("Process loop excceed time limit: 3min");
      resolve();
    }, 1000 * 60 * 3)

    try {
      await this.fn(this.queue);
      clearTimeout(timeout);
    } catch (e) {
      Logger.error(e);
    } finally {
      resolve();
    }
  }

  addListener = (id: string) => {
    if (this.listeners.has(id)) return;
    this.listeners.add(id);
    process.nextTick(this.runLoop);
  }

  removeListener = (id: string) => {
    if (!this.listeners.has(id)) return;
    this.listeners.delete(id);
  }
}