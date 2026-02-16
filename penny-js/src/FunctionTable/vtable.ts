import { TaskFn } from "../deque/deque";

// NOTE: Unfortunaly, the Fn list cannot be stored into a SAB in any meaningful way, this makes it harder to avoid copying the whole vTable into each thread's memory, which is not great. unless the browser engine (v8/spidermonkey etc.) doesn't actually copy the function code? Need to crosscheck
export class Vtable {
  vTable: Map<string, TaskFn> = new Map();

  // Right now, I'm leaning towards the idea of pushMethod updating the method in the Map, if the name matches. But that might be bugprone and unexpected for the user. Could be better to have seperate methods, with clear seperation
  pushMethod(fn: TaskFn, name: string) {
    // TODO: Should add name mangling here, in case the prototype of the function is different but the name is same, to avoid runtime collision
    this.vTable.set(name, fn);
  }
}
