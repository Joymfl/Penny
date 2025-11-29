
// Since only the thread that owns this chunk of memory can access it, this metadata can be lock free
// Task metadata list
export const STATE_SIZE = 1; //; u8 for thread state
export const ACTIVE_TASKS_SIZE = 4; // int32 but it caps out at 10. Could potentially save memory here
export const THREAD_ID_SIZE = 1; // u8 here [0...10]


// Deque List
const POINTER_SIZE = 4 *2; // couldn't find a better name, but this is the top and bottom pointer of the chase-lev circular buffer. int32 each
export const THREAD_TASK_CAPACITY = 10; // Num of tasks per thread
const SIZE_PER_TASK = 4; // uint32
export const THREAD_MEMORY_SIZE = (STATE_SIZE + ACTIVE_TASKS_SIZE + THREAD_ID_SIZE + POINTER_SIZE +  (THREAD_TASK_CAPACITY*SIZE_PER_TASK));

const THREAD_COUNT = 4;
const SAB_MEMORY = THREAD_MEMORY_SIZE * THREAD_COUNT ; // Totally memory to account for all thread deques

export const TOP_OFFSET =  STATE_SIZE + ACTIVE_TASKS_SIZE + THREAD_ID_SIZE;
export const BOTTOM_OFFSET = TOP_OFFSET + 4;

export class MemoryModel {
    sab: SharedArrayBuffer;

    constructor() {
        this.sab = new SharedArrayBuffer(SAB_MEMORY);
    }

}

