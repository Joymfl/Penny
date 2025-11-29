import {Deque} from "../deque/deque";
import {Vtable} from "../FunctionTable/vtable";

export enum ThreadState {
	Running = 1,
	Sleeping = 2,
	Blocked = 3 //Maybe I can use blocked as a state for when it's doing I/O, since I can make that thread steal easily. But what if the I/O returns early while the task is running? Should I block the ongoing task, complete I/O return handling and then resume?
				// I should look into priority queuing for this, and how to handle same priority tasks. I read about MLFQ somewhere, look into that. TODO
}
interface TaskFrame {
	id: number;
	continuationMarker?: number;
	state: ThreadState;
}

export interface VirtualThread {
	frame: TaskFrame;
	worker: Worker;
}

export function createThread(id: any, globalFunctionTable: Vtable): VirtualThread {
	const worker = new Worker(new URL('../worker/worker.js', import.meta.url), {type: "module"});
	return {
		frame: {
			id,
			continuationMarker: undefined,
			state: ThreadState.Sleeping,
		},
		worker
	};
}