import { Scheduler } from "./scheduler/scheduler";

// Would be better if this was long running sampling
export async function runBenchmark(threadCount: number) {
  const scheduler = new Scheduler(threadCount);
  await scheduler.waitForReady();
  const NUM_TASKS = 100;

  const start = performance.now();
  console.log(`start: ${start}`);

  let completed = 0;

  scheduler.onResult((result) => {
    completed++;
    console.log(`result of thread: ${result.data}`);
    if (completed === NUM_TASKS) {
      const end = performance.now();
      console.log("Done: ", {
        total: NUM_TASKS,
        timeMs: end - start,
        throughputTPS: Math.round(NUM_TASKS / (end - start) / 1000),
      });
    }
  });

  for (let i = 0; i < NUM_TASKS; i++) {
    scheduler.newTask(1, i, i + 1);
  }
}

