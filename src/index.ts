import {Scheduler} from "./scheduler/scheduler";
import {Vtable} from "./FunctionTable/vtable";
import {runBenchmark} from "./benchmark";


// testing dynamic function loading
// const functionTable = new Vtable();
// functionTable.pushMethod((input1: number, input2: number) => {console.log("New vtable method",input1 + input2)}, "add");
// console.log(JSON.stringify(functionTable));
// let fetchedMethod = functionTable.vTable.get("add");
// if (fetchedMethod){
//     fetchedMethod(1,2);
// }

// const worker = new Worker(new URL('./worker/test_worker.js', import.meta.url), {type: "module"});
// worker.postMessage("ping")

runBenchmark(4);
