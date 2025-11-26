import WorkerThread from './threads/thread.js?worker';

const w = new WorkerThread();

w.onmessage = (ev) => {
    console.log("result: ", ev.data);
};

w.postMessage({id: 2, fn_id: 2, args: [3]});
