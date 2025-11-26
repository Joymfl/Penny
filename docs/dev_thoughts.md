The scheduler can be thought of as a reverse proxy for user compute requests. wild.
But this begs the question: can the compute workload, that the scheduler receives be distributed over multiple nodes? What if we virtualize the thread pool of all willing clients, and split workload between them?

I would need to find a way to split up a task into atomic tasks or microtasks, to be able to do this. 