// type Fn = (...args: any[]) => any;
//
// type VTable<T extends Record<number, Fn>> = T;


const VTable = {
    1: (a,b) => a +b,
    2: (n) => n * n
};

self.onmessage = (ev) => {
    const {fn_id, args} = ev.data;
    const result = VTable[fn_id](...args) ;
    self.postMessage(result);
}