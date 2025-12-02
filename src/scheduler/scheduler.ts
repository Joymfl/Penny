import {createThread, ThreadState, VirtualThread} from "../threads/thread";
import {Vtable} from "../FunctionTable/vtable";
import {MemoryModel} from "./mem-model";
import {Thread} from "../deque/deque";


export class Scheduler {
    threadPool:  Thread[] = [];
    vTable: Vtable | undefined = undefined;
    // This is the only way I can think of to provide a mechanism, to allow threads to steal from each other
    // The issue is, that in the browser, worker threads, can't look into other thread's memories (afaik), but doing it in a shared buffer, with careful atomics could be a promising workaround
    GlobalTaskDequeList: MemoryModel;
    resultCallback: (ev: MessageEvent<any>) =>void = (ev: MessageEvent<any>) => {console.log(ev.data)};

    // Use the id, to identify the indice of the thread is being used
    constructor(threadCount = navigator.hardwareConcurrency || 4 ) {
        this.GlobalTaskDequeList = new MemoryModel();

        // not providing override of scheduler vTable for now.
        for (let i = 0; i < threadCount; i ++){
            const thread = new Thread(  i, this.GlobalTaskDequeList.sab);
            // const thread = createThread(i, this.vTable);
            thread.worker.onmessage = (ev: any) => {
                this.resultCallback(ev);
            }

            thread.worker.onerror = (e) => {
                console.error("WORKER ERROR:", e);
            };

            thread.worker.onmessageerror = (e) => {
                console.error("WORKER MESSAGE ERROR:", e);
            };
            thread.top[0] = 0;
            thread.bottom[0] = 0;
            thread.worker.postMessage({sab: this.GlobalTaskDequeList.sab, threadId: i});
           this.threadPool.push(thread);
        }
    }

    onResult(cb: (ev: MessageEvent<any>)=>void) {
        this.resultCallback = cb;
    }

    newTask(taskId: number, ...args: any[]){
        // Randomly find a thread to assign task to, but it would be better if we had thread states to always assign to idle or low prio threads
        const randThreadIndex = Math.floor(Math.random() * this.threadPool.length);

        const worker = this.threadPool[randThreadIndex].worker;
        this.threadPool[randThreadIndex].state[0]= 1;
        this.threadPool[randThreadIndex].tasklist[this.threadPool[randThreadIndex].bottom[0]] = taskId;
        let b = Atomics.load(this.threadPool[randThreadIndex].bottom, 0);
        Atomics.compareExchange(this.threadPool[randThreadIndex].bottom, 0, b, b+1);
        worker.postMessage({args});
        Atomics.store(this.threadPool[randThreadIndex].state, 0, 1);
        Atomics.notify(this.threadPool[randThreadIndex].state, 0, 1);
    }
}