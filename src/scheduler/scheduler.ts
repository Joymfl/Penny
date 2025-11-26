import {createThread, VirtualThread} from "../threads/thread";

export class Scheduler {
    threadPool: VirtualThread[] = [];

    // Use the id, to identify the indice of the thread is being used
    constructor(threadCount = navigator.hardwareConcurrency || 4, cb: (ev: MessageEvent<any>) => void) {
        for (let i = 0; i < threadCount; i ++){
            const vt = createThread(i);
            vt.worker.onmessage = (ev) => {
                cb(ev);
            }
           this.threadPool.push(vt);
        }
    }

    newTask(taskId: number, ...args: any[]){
        // Randomly find a thread to assign task to, but it would be better if we had thread states to always assign to idle or low prio threads
        const worker = this.threadPool[Math.floor(Math.random() * this.threadPool.length)].worker;
        worker.postMessage({id: 2, fn_id: taskId, args });
    }
}