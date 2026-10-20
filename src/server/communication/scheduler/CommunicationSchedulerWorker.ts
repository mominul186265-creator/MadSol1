import { CommunicationDbRepository } from '../storage/CommunicationDbRepository';
import { CommunicationManager } from '../services/CommunicationManager';

/**
 * Production-Grade Background Scheduler Worker
 * 
 * Reliability & Idempotency Features:
 * 1. Persistent Atomic Locking: Uses repository-level atomic claim to prevent duplicate execution across workers/processes.
 * 2. Server Restart Safety: Automatically scans persistent storage upon worker boot for any due jobs.
 * 3. Crash Recovery Watchdog: Automatically identifies and recovers stuck 'processing' jobs after node/process crashes.
 * 4. Institution Isolation: All jobs are executed within their respective institution scope.
 */
export class CommunicationSchedulerWorker {
  private static instance: CommunicationSchedulerWorker;
  private intervalId: NodeJS.Timeout | null = null;
  private recoveryIntervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private isTickRunning: boolean = false;
  private readonly workerId: string;
  private readonly checkIntervalMs: number = 5000; // Poll every 5 seconds
  private readonly recoveryIntervalMs: number = 60000; // Recovery watchdog every 60 seconds

  private constructor() {
    this.workerId = `worker_${process.pid}_${Math.random().toString(36).substring(2, 8)}`;
  }

  public static getInstance(): CommunicationSchedulerWorker {
    if (!CommunicationSchedulerWorker.instance) {
      CommunicationSchedulerWorker.instance = new CommunicationSchedulerWorker();
    }
    return CommunicationSchedulerWorker.instance;
  }

  /**
   * Start Background Scheduler Worker and Watchdogs
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log(
      `[MadSol Scheduler Worker: ${this.workerId}] Started. Poll interval: ${this.checkIntervalMs / 1000}s.`
    );

    // Initial crash recovery check on startup
    this.runCrashRecovery();

    // Main polling interval for scheduled broadcast execution
    this.intervalId = setInterval(() => {
      this.tick();
    }, this.checkIntervalMs);

    // Periodic watchdog for orphaned/stuck job recovery
    this.recoveryIntervalId = setInterval(() => {
      this.runCrashRecovery();
    }, this.recoveryIntervalMs);

    // Run first tick immediately
    setTimeout(() => {
      this.tick();
    }, 1500);
  }

  /**
   * Stop Background Scheduler Worker
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.recoveryIntervalId) {
      clearInterval(this.recoveryIntervalId);
      this.recoveryIntervalId = null;
    }
    this.isRunning = false;
    console.log(`[MadSol Scheduler Worker: ${this.workerId}] Stopped.`);
  }

  /**
   * Run Crash Recovery Watchdog
   */
  private runCrashRecovery(): void {
    try {
      const repo = CommunicationDbRepository.getInstance();
      const recovered = repo.recoverStuckProcessingJobs(180000); // 3 minutes threshold
      if (recovered > 0) {
        console.warn(
          `[MadSol Scheduler Watchdog] Recovered ${recovered} stuck/orphaned job(s) from previous abnormal termination.`
        );
      }
    } catch (err) {
      console.error('[MadSol Scheduler Watchdog] Error running recovery:', err);
    }
  }

  /**
   * Single Scheduler Tick
   * Scans persistent storage and claims due jobs atomically
   */
  public async tick(): Promise<void> {
    if (this.isTickRunning) return;
    this.isTickRunning = true;

    try {
      const repo = CommunicationDbRepository.getInstance();
      const dueMessages = repo.getDueScheduledMessages();

      if (dueMessages.length > 0) {
        console.log(
          `[MadSol Scheduler] Found ${dueMessages.length} candidate scheduled broadcast(s) to process.`
        );
      }

      for (const candidate of dueMessages) {
        // Atomic persistent claim: prevents duplicate execution across multiple workers or processes
        const claimedJob = repo.claimScheduledMessage(
          candidate.institutionId,
          candidate.id,
          this.workerId,
          90000 // 90 seconds lock duration
        );

        if (!claimedJob) {
          // Already claimed by another worker or in-flight processing
          continue;
        }

        try {
          console.log(
            `[MadSol Scheduler] Executing claimed broadcast ${claimedJob.id} [${claimedJob.type.toUpperCase()}] for institution: ${claimedJob.institutionId}`
          );
          const manager = CommunicationManager.getInstance();
          await manager.processScheduledJob(claimedJob.institutionId, claimedJob.id);
        } catch (err: any) {
          console.error(
            `[MadSol Scheduler] Execution failure for scheduled job ${claimedJob.id}:`,
            err
          );
        }
      }
    } catch (err) {
      console.error('[MadSol Scheduler] Error during worker tick:', err);
    } finally {
      this.isTickRunning = false;
    }
  }
}
