## Architecture notes 
### Topic: Exploration into a cross platform runtime layer for parallel execution of tasks

Initial thoughts:
 The idea presented itself to me while looking at UE5's taskgraph, and noticing my colleagues difficulty with web workers. Reading more about the topic has revealed the concept of work stealing scheduler based on cilk, and the interesting challenges involved in it.
I think it'll be an interesting exploration on seeing how far this can be pushed on browser environments, given their sandbox nature.

Basic intuition:
- Treat threads like OS processes. Give them a small slice of memory, so that they can remember where they are and where to continue execution. Also, give them a deque to represent the backlog of tasks (similar to an engineer lol), this comes in handy when trying to steal, or being stolen from. 
In my head it looks like this  | Owning thread pulls from here <- [task1] [task2] [task3] [task4] -> Stealing thread pulls from here | this is cool because, it can be completely lock free, since the two interacting threads don't need to know about each other.
My main concern is, what happens if there's only 1 task left in the queue? and if the owning thread is just finished the second last task, while at the same time, the stealing thread is there to capture the last item? Will have to reason about this
- Let's not get stuck up on worker threads being the only abstraction. If we virtualize the concept of a "thread", then this scheduler logic can live inside any JS compatible environment, and we can plug in the thread that's being used - whether they be worker threads / native OS threads etc.
- I'm still not clear as of right now, how I want threads to execute the methods, that the user will add to the dependency graph. Worker threads, expect a script file to be defined while being constructed. But, I wonder if I can create an object that contains the method to be executed. Something like:
 struct WorkToBeDone{
fn1: (arg1, arg2) -> {// logic}
fn2: (arg1) -> {// logic}
}
or if I use a vtable sort of construct, to have a map of which method needs to be executed. Which would make the most sense? Need to explore possibilities here.
- Since asking for memory every time would be a pain, we could use a linear chunk of memory , and then use a bump allocater to assign memory for each thread. Sort of like a stack for each thread, virtualized from a linear byte array. This seems conceptually similar to how I think process addresses in an OS works, but not sure. Should confirm this. I have a gut feeling Shared Array buffers might be useful here.
- I need some sort of a dependency graph, so that I make sure that I don't execute tasks, that depend on the result of another task in parallel. DAGs look promising for this 

- The message passing model of worker thread might be a performance bottleneck. Confirm this.

Current Iteration:
- Have a static function table for workers to select tasks and execute. This is not ideal, as I want the scheduler to be able to accept tasks at runtime -> convert to tiny pieces and execute.
would be really cool, if there's a way I can think of to make it execute like a CPU and do out of order executions, while respecting data boundaries. Todo: read up on this topic a bit more

`Current VTable shape
 const VTable= {
id (1): (a,b) => a + b,
id (2): (n) => n*n
}`


- I wanted an object shape that I could add methods to during runtime, for the threads to be able to read. It currently looks like this: 
  ```
      export class Vtable {
      vTable: any = [];

      constructor() {
      }

      pushMethod(fn: any) {
      this.vTable.push(fn);
      }
      }
  ```
  A few issues with this. Not strongly typed, so anyone can push whatever they want, giving no runtime guarantee. How I miss C right now. But, this can be solved with a generic template for the interface and careful management of what I want to expose. for starters, letting the function table being public is not great.
  This is just an JS object, copying the method signature. A true vtable would have function pointer, which would be easier to manipulate and be faster in runtime, I should look into if there's a better way to do this? Again, wrapping the scheduler in wasm comes to mind, but I wonder if I can control the lifetime of the object on both sides of the boundary.
  Also, these methods need identifiers to enable reuse and general dx. For example, let's say I define a method that is to be added to this list, and later I want to add another method that depends on the first one. Currently I'll have to define all the methods again and again, that's not ideal. Better yet, I can do something close to what name mangling is: take in a user defined function "name", and then map it to a generated name. We could use data structures like hashmap to enable O(1) lookup of names, when it needs to be referenced again.
  Same applies for threads, but since it'll be internal to the scheduler, I feel like uuids or something that don't collide, would be a better option. Name of the game? avoid name/id collisions. But, I wonder how much of a difference in compute time this would have to a pointer based implementation of vtable? Not that much for small projects I'm sure, but as the number of methods explode, this table would be at risk of consuming a lot of memory, which the browser isn't very friendly about sharing
  ### Why do I want runtime based function table as opposed to compile time? 
- My initial intuition is memory is a bit more important to let other tasks breathe that run on the main thread
- The "tasks" and scheduler will start of with a smaller mem footprint, and then lazily grows, as tasks are assigned to it based on runtime

This should in general improve startup time and would technically enable dynamic workloads, but the pain and carefulness of using this would be offloaded to the caller

 ### What to do about the lack of stacks in JS environment?
    This is a hard one, on one hand for proper fibers, and cooperative yielding, I would love to have stacks for my threads, as that will let me store the execution state (similar to how OSes do it), but the sandbox nature of browsers won't let me do it. How would I resolve this?
    My naive intuition is telling me to fake the thread stack, and autogenerate await() points in the user's method. Something like | User function -> Convert to string -> randomly split function with yield() methods -> register on vTable| This way, when a thread picks up the task, it'll naturally yield, essentially giving me the microjobs I want. But copying this stack around, and maintaining multiple copies of it per thread, for each task it runs, doesn't seem right: it'll bog down performance. This obviously doesn't give me true fibers, only artificial suspension points. Hacky, not a real stack capture and might be a pain = I'll need to be careful about semantics used
    Could I use a code generator for creating these yield points? I should explore how I would transform user code into a generator state machine

    I found that the WASM stack switching proposal, would be a good resolution here, and gets in line with my intention of having my scheduler core in wasm, but that would be a future improvement. For now, let's see how far we can push it for the current browser environment, and if it's any improvement
    When I say ‘fake stack’, I’m not referring to capturing the real JS call stack. I mean a userland data structure where I store program counters, variables, or generator state to simulate suspension points.

#### Long-term solution: WASM stack switching → real fibers → real stack suspension. For V1 I’ll simulate this behavior as best as the environment allows.



Notes to self:
- Read the Go scheduler architecture
- Read tokio and rayon internals


Notes about V1:
- Built an interface around the thread called Virtual threads, need to test out if I can actually swap out the internal thread in a clean way
- Need to use typescript to harden the api to call methods from Scheduler
- The scheduler basically just has a static array of a list of threads, kind of like a thread pool. This was done to avoid the overhead of creating a new one a task came in.The next step would be to autoamtically assign tasks to a free thread, maybe I should hold the state of a thread somewhere? maybe split between IDLE/Running/Ready state machine, to help my scheduler choose
- Current flow |Initializing scheduler creates either user input or queries number of hardware threads -> add a task to scheduler -> scheduler executes |
- Biggest issue right now, is that, literally only 4 tasks can be assigned to the scheduler, and it's chosen at random which thread to run the task on. This isn't great haha, but the actual scheduler engineering starts now!
- Should find a way to track which thread is doing what job at a given point. Would be really helpful for actual benchmarking or debugging