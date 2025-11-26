const VTABLE = {
	1: (a,b) => a + b,
	2: (n) => n*n,
	3: (arr) => arr.reduce((x,y) =>x+y, 0)
}

self.onmessage = (evt) => {
const task = evt.data;
const fn = VTABLE[task.fn_id];
const result = fn(...task.args);
self.postMessage({id: task.id, result});
}

