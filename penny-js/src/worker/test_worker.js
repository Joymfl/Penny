import * as M from "../scheduler/mem-model";

console.log("import succeeded:", M);

self.onmessage = (ev) => {
  console.log("ping");
};
