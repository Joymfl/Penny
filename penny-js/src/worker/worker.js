import {
    STATE_SIZE,
    THREAD_ID_SIZE,
    THREAD_MEMORY_SIZE,
    TOP_OFFSET,
    BOTTOM_OFFSET,
    THREAD_TASK_CAPACITY
} from "../scheduler/mem-model.js";

let state;
let thread_id;
let number_active_tasks;
let top;
let bottom;
let tasklist;

let args;           // shared argument buffer
let args_set = false;
let initialized = false;

let functionRegistry = {
    1: (a, b) => a + b,
    2: (a, b) => a * b,
};

let sab;

self.onmessage = (ev) => {
    // INITIALIZATION MESSAGE
    if (ev.data.sab) {
        sab = ev.data.sab;

        const baseOffset = ev.data.threadId * THREAD_MEMORY_SIZE;

        state = new Int32Array(sab, baseOffset, 1);
        state[0] = 0; // sleeping

        thread_id = new Uint32Array(sab, baseOffset + STATE_SIZE, 1);
        thread_id[0] = ev.data.threadId;

        number_active_tasks = new Uint32Array(
            sab,
            baseOffset + STATE_SIZE + THREAD_ID_SIZE,
            1
        );

        top = new Uint32Array(sab, baseOffset + TOP_OFFSET, 1);
        bottom = new Uint32Array(sab, baseOffset + BOTTOM_OFFSET, 1);
        tasklist = new Uint32Array(
            sab,
            baseOffset + BOTTOM_OFFSET + 4,
            THREAD_TASK_CAPACITY
        );

        initialized = true;
        self.postMessage({type: "READY"});
        return;
    }

    // ARGUMENT MESSAGE
    if (ev.data.args) {
        args = ev.data.args;
        args_set = true;

        // Wake worker
        Atomics.store(state, 0, 1);
        Atomics.notify(state, 0, 1);
        return;
    }
};

// -------- Worker Main Loop ---------

async function mainLoop() {

    // KEEP WAITING UNTIL SAB ARRIVES
    while (!initialized) {
        await new Promise(r => setTimeout(r, 0));
    }

    for (;;) {
        // Sleep until state == 1 (work available)
        Atomics.wait(state, 0, 0);

        // PROCESS ALL TASKS
        while (true) {
            let fnId = popTask();
            if (fnId === null) break;

            if (args_set) {
                const result = functionRegistry[fnId](...args);
                self.postMessage(result);
            }
        }

        // no more tasks, go back to sleep
        Atomics.store(state, 0, 0);
    }
}

mainLoop();

// -------- Helper: Pop a task from LOCAL deque --------

function popTask() {
    if (!initialized || !args_set) return null;

    let b = Atomics.sub(bottom, 0, 1); // returns previous value

    if (b <= Atomics.load(top, 0)) {
        // queue is empty → undo the decrement
        Atomics.add(bottom, 0, 1);
        return null;
    }

    const index = (b - 1) % THREAD_TASK_CAPACITY;
    return tasklist[index];
}
