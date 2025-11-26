The scheduler can be thought of as a reverse proxy for user compute requests. wild.
But this begs the question: can the compute workload, that the scheduler receives be distributed over multiple nodes? What if we virtualize the thread pool of all willing clients, and split workload between them?

I would need to find a way to split up a task into atomic tasks or microtasks, to be able to do this. 

--------------------------
Fibers need stack control in the threads, don't have that in web workers, but the wasm stack switching proposal is promising. Look into experimenting with that for v2 with wasmtime
---------------------------

A concern I have with this project, is that I don't control a lot of the aspects. I don't have full control over the memory layout, I don't know how much these abstractions in JS cost and a few others. I wonder if I should use WASM for the core scheduler, treat workers/threads as an abstraction that the scheduler doesn't need to know about?



