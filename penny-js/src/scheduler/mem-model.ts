//TODO: Need to update the memory model to actually hold slots for 200 tasks. SAB slot per thread should hold, task it's running, whether it's paused, done or running. Initial thought is, it should be of TaskType<T> T being the return value.

// Since only the thread that owns this chunk of memory can access it, this metadata can be lock free
// Task metadata list
export const STATE_SIZE = 4; //; u32 for thread state. For Atomics.wait/notify
export const THREAD_ID_SIZE = 4; // u8 here [0...10]
export const ACTIVE_TASKS_SIZE = 4; // int32 but it caps out at 10. Arbitrary, change based on execution time

export const METADATA_SIZE = STATE_SIZE + ACTIVE_TASKS_SIZE + THREAD_ID_SIZE;

// Deque List
const POINTER_SIZE = 4 * 2; // couldn't find a better name, but this is the top and bottom pointer of the chase-lev circular buffer. int32 each
export const THREAD_TASK_CAPACITY = 10; // Num of tasks per thread
const SIZE_PER_TASK = 4; // uint32
export const THREAD_MEMORY_SIZE =
  METADATA_SIZE + POINTER_SIZE + THREAD_TASK_CAPACITY * SIZE_PER_TASK;

const THREAD_COUNT = 4; // make this dynamic, i.e init this at runtime based on host availibility. Short circuit if host env can't support multithreading
const TOTAL_THREAD_TABLE = THREAD_MEMORY_SIZE * THREAD_COUNT; // Totally memory to account for all thread deques

export const TOP_OFFSET = METADATA_SIZE;
export const BOTTOM_OFFSET = TOP_OFFSET + 4;

//GLOBAL Task registry
const REGISTRY_START = TOTAL_THREAD_TABLE;
const MAX_TASKS = 200;
const TASK_ITER = 4;
const MAX_ITER = 4; // 4 bytes for now, just for testing
const OWNER_THREAD_ID = 4; // can only hold 1 thread id at a time. -1 represents that it's free to claim
const STATUS = 1; // RUNNING, DONE, BLOCKED (I/O?), FREE. NOTE: DONE != FREE

const TASK_METADATA =
  (TASK_ITER + MAX_ITER + OWNER_THREAD_ID + STATUS) * MAX_TASKS;

const TOTAL_REGISTRY_SIZE = THREAD_COUNT * TASK_METADATA;

//
//
//                 ┌────────────┼────────────────────────────────────────────────────────────────────┐
//                 │            │                                                                    │
//                 │   Thread 1 │                                                                    │
//                 │┌───┬───┬──┐│               Per Thread Deque                                     │
//                 ││Tsk│Tsk│  ││                                                                    │
//                 │└───┴───┴──┘│                                                                    │
//                 │            │                                                                    │
//                 ├────────────┼───────────┬──────────┬───────────┬─────────┬───────────────────────┤
//                 │            │  Task 2   │          │           │         │                       │
//                 │            │   Args    │          │           │         │                       │
//                 │   Task     │   Iter    │  ────────┼───────────┼─────────┼─►   Task N            │
//                 │    1       │   Max     │          │           │         │                       │
//                 │            │   Owner?  │          │           │         │                       │
//                 │            │           │          │           │         │                       │
//                 │            │           │          │           │         │                       │
//                 └────────────┴───────────┴──────────┴───────────┴─────────┴───────────────────────┘
//
//

export class MemoryModel {
  sab: SharedArrayBuffer;

  constructor() {
    this.sab = new SharedArrayBuffer(TOTAL_THREAD_TABLE + TOTAL_REGISTRY_SIZE);
  }
}
