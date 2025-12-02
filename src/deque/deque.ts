import {Vtable} from '../FunctionTable/vtable'
import {
    ACTIVE_TASKS_SIZE,
    BOTTOM_OFFSET,
    STATE_SIZE, THREAD_ID_SIZE,
    THREAD_MEMORY_SIZE,
    THREAD_TASK_CAPACITY,
    TOP_OFFSET
} from "../scheduler/mem-model";
import {createThread} from "../threads/thread";

// Thread States
// 0 -> sleeping, 1 -> running, 2 -> blocked

// For now, let's make sure all functions don't have a return value
export type TaskFn = (...args: any[]) => void;

export class Thread {
    // Should every table have a copy of the "whole" function table or just a list of tasks it needs to do?
    worker;
    // Deque data. Lives under shared memory.
    tasklist;
    top;
    bottom;
    state;
    number_active_tasks;
    thread_id;

    constructor(threadId: number,sab: SharedArrayBuffer ){
        const baseOffset = threadId*THREAD_MEMORY_SIZE;

        // thread metadata
        this.state = new Int32Array(sab, baseOffset, 1);
        this.state[0] = 0; // Sleeping
        this.thread_id = new Uint32Array(sab, baseOffset + STATE_SIZE , 1);
        this.thread_id[0] = threadId;
        this.number_active_tasks = new Uint32Array(sab, baseOffset + STATE_SIZE + THREAD_ID_SIZE , 1);
        this.number_active_tasks[0] = 0;

        // Thread deque
        this.top = new Uint32Array(sab, baseOffset + TOP_OFFSET,1);
        this.top[0] = 0;
        this.bottom = new Uint32Array(sab, baseOffset + BOTTOM_OFFSET,1);
        this.bottom[0] = 0;
        this.tasklist = new Uint32Array(sab, baseOffset + BOTTOM_OFFSET + 4, THREAD_TASK_CAPACITY);
        // If all above succeedds. Create worker thread
        console.log("creating thread: ", threadId);
        this.worker = this.createWorker(threadId);
    }

    createWorker(threadId: number) {

        return  new Worker(new URL('../worker/worker.js', import.meta.url), {type: "module"});
    }

    setState(state: number) {
        this.state[0] = state;
    }


}