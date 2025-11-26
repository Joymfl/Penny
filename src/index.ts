import {Scheduler} from "./scheduler/scheduler";
import {Vtable} from "./FunctionTable/vtable";

const resp   = (ev: MessageEvent<any>) =>  {
console.log("Result:", ev.data);
}

const taskScheduler = new Scheduler(4, resp);

taskScheduler.newTask(1, 1,3);
taskScheduler.newTask(1, 3,3);
taskScheduler.newTask(1, 2,1);
taskScheduler.newTask(1, 4,15);
taskScheduler.newTask(2, 16);
taskScheduler.newTask(2, 12);
taskScheduler.newTask(2, 4);
taskScheduler.newTask(2, 3);


// testing dynamic function loading
const functionTable = new Vtable();
functionTable.pushMethod((input1: number, input2: number) => {console.log("New vtable method",input1 + input2)});
console.log(JSON.stringify(functionTable));
functionTable.vTable[0](1,2);