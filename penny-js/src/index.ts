import { Scheduler } from "./scheduler/scheduler";
import { Vtable } from "./FunctionTable/vtable";
import { runBenchmark } from "./benchmark";

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

// runBenchmark(4);

// (async () => {const scheduler = new Scheduler(4);
// await scheduler.waitForReady();
// console.log("thread ready!");
// scheduler.newTask(1, 2,3);
// scheduler.newTask(1, 22,2000);
// scheduler.newTask(1, 40,43);
// scheduler.newTask(1, 28,999);
// scheduler.newTask(2, 40,40);
// scheduler.newTask(2, 20,1);
// })();
