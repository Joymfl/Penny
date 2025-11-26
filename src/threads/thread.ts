enum ThreadState {
	Running = 1,
	Sleeping = 2,
	Blocked = 3
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

export function createThread(id: any): VirtualThread {
	const worker = new Worker(new URL('../worker/worker.js', import.meta.url), {type: "module"});
	return {
		frame: {
			id,
			continuationMarker: undefined,
			state: ThreadState.Sleeping
		},
		worker
	};
}