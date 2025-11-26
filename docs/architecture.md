## Architecture notes 
### Topic: Exploration into a cross platform runtime layer for parallel execution of tasks

Initial thoughts:
 The idea presented itself to me while looking at UE5's taskgraph. Reading more about the topic has revealed the concept of work stealing scheduler based on cilk, and the interesting challenges involved in it.
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



Notes to self:
- Read the Go scheduler architecture
- Read tokio and rayon internals


Notes about V1:
- Built an interface around the thread called Virtual threads, need to test out if I can actually swap out the internal thread in a clean way
- Need to use typescript to harden the api to call methods from Scheduler
- The scheduler basically just has a static array of a list of threads, kind of like a thread pool. This was done to avoid the overhead of creating a new one a task came in.The next step would be to autoamtically assign tasks to a free thread, maybe I should hold the state of a thread somewhere? maybe split between IDLE/Running/Ready state machine, to help my scheduler choose
- Current flow |Initializing scheduler creates either user input or queries number of hardware threads -> add a task to scheduler -> scheduler executes |
- Biggest issue right now, is that, literally only 4 tasks can be assigned to the scheduler. This isn't great haha, but the actual scheduler engineering starts now!