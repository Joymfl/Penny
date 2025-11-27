import {createThread, ThreadState, VirtualThread} from "../threads/thread";

export class Scheduler {
    threadPool: VirtualThread[] = [];

    // Use the id, to identify the indice of the thread is being used
    constructor(threadCount = navigator.hardwareConcurrency || 4, cb: (ev: MessageEvent<any>) => void) {
        for (let i = 0; i < threadCount; i ++){
            const vt = createThread(i);
            // Just creating the thread pool
            vt.frame.state = ThreadState.Sleeping;
            // This way of handling callbacks, assumes that methods only expect messages once the thread has computed the results. This is honestly very rigid, and I'm not a big fan of removing flexibility for the user. TODO: Rethink this approach, maybe if I implement the fake thread stack, I can use that to update the caller about the status?
            vt.worker.onmessage = (ev) => {
                vt.frame.state = ThreadState.Sleeping;
                cb(ev);
            }
           this.threadPool.push(vt);
        }
    }

    newTask(taskId: number, ...args: any[]){
        // Randomly find a thread to assign task to, but it would be better if we had thread states to always assign to idle or low prio threads
        let threadIndexToRun: number | undefined = undefined; // should also be undefined
        let attemptCtr = 0; // So that the scheduler doesn't keep infinitely trying to find an idle thread, in case every thread is busy. Ideally I would use a pending queue for tasks, to be moved into, but this is an initial test
        for (attemptCtr = 0; attemptCtr < 5 ; attemptCtr ++) { // 5 is static for now, this should be dynamic based on user workload, I think
            const randThreadIndex = Math.floor(Math.random() * this.threadPool.length);
            if (this.threadPool[randThreadIndex].frame.state !== ThreadState.Running){
                threadIndexToRun  = randThreadIndex;
                break;
            }
        }
        if (threadIndexToRun != undefined) {
            console.log("Found thread! running task.....")
            const worker = this.threadPool[threadIndexToRun].worker;
            this.threadPool[threadIndexToRun].frame.state = ThreadState.Running;
            worker.postMessage({id: 2, fn_id: taskId, args});
        }
    }
}