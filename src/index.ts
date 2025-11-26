import {Scheduler} from "./scheduler/scheduler";

const resp   = (ev: MessageEvent<any>) =>  {
console.log("Result:", ev.data);
}

const taskScheduler = new Scheduler(4, resp);

taskScheduler.newTask(1, 1,3);