export interface VirtualThread {
	id: number;
	worker: Worker;
}

export function createThread(id: any): VirtualThread {
	const worker = new Worker(new URL('../worker/worker.js', import.meta.url), {type: "module"});
	return {id, worker};
}