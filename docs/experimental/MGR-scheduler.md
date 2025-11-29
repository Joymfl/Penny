## MGR Scheduler – Merry-Go-Round Scheduler (Experimental)

This is my *“what if?”* attempt at a scheduler design for browser environments.

### Constraints

The browser gives us a few annoying constraints:

- No real thread stacks for Workers (no stack introspection, no stack stealing).
- No stack switching yet (only a proposal for WASM).
- Cooperative yielding is hard — generating good `yield` points in user code is non-trivial (I’m currently exploring generators to emulate this).

So instead of trying to force a traditional scheduler model into this world, the idea is to flip the problem around.

---

## Motivation

The high-level thought:

> What if I stop thinking of *threads moving through tasks*, and instead think of *tasks rotating under threads*?

Concretely:

- All tasks live in a **rotating ring buffer** (the “merry-go-round”).
- Each thread only has access to a **small slice/view** of that ring at any point in time (e.g. one slot, or a small window).
- Threads don’t carry stacks. Instead, any *continuation state* for a task lives **inside the task’s slot** in shared memory.
- Periodically, the **ring rotates**:
    - the mapping `thread → slot` changes
    - effectively “forcing” a yield, because the thread’s current slot view changes
    - the next thread that sees a slot can resume that task from its stored continuation state

So instead of per-thread stacks + stack switching, the MGR model tries to:

- make **tasks own their own “frame”** (state/continuation) in shared memory, and
- make **threads interchangeable executors** that pick up whatever slot is currently under them.

Yielding isn’t explicit (`yield()`); it’s an effect of the ring rotation.

---

## Concerns / Open Questions

1. **Task count vs thread count (m vs n)**

Let:

- `m` = number of tasks in the ring
- `n` = number of threads

In the naive version of this model:

- If `m approximately equals n`, each thread can map cleanly to a “current slot”, and the ring feels well-balanced.
- If `m >> n`, we need a policy for:
    - which tasks are “active” in this rotation
    - how backlogged tasks wait for a slot
- If `m << n`, some threads will simply idle.

So the naive design implicitly wants `m approximately equals n` for full utilization.  
To relax this, I probably need to:

- split user tasks into **micro-jobs**, and
- batch them or pack them into fixed-size slots
- or allow each slot to represent a *queue* of micro-tasks instead of a single one.

2. **Rotation cost / global pauses**

When the ring buffer “shuffles” (rotates):

- some kind of synchronization is required
- in the worst case, no task can make forward progress during the rotation step

This could be a serious problem if:

- the rotation frequency is high, or
- the atomic/memory operations for rotating slots are expensive.

A benchmark against a more conventional Cilk-style work-stealing scheduler would be very useful here to see whether:

- the “no per-thread stack” benefit outweighs
- the cost of global rotation / coordination.

3. **Task stealing and locality**

In the pure MGR version:

- there isn’t really a concept of per-thread queues, so classical work-stealing doesn’t apply directly.
- all “locality” is expressed through the ring sequence and rotation policy, not through ownership.

One idea:

- let each thread keep a tiny bit of local metadata about “which slot it prefers to target” (or which logical task group it wants to steal from), and
- allow the scheduler to *bias* the rotation / mapping based on that.
- combine this with a **per-thread deque** (like Cilk) and use the ring as a higher-level “dispersion / fairness layer”.

I’m not sure yet if this can be made lock-free or if the complexity is even worth it. TODO: think more about whether there’s a hybrid MGR + deque model that isn’t obviously worse than standard work-stealing.

---
![MGR Idea](./diagrams/MGR-Scheduler.png)
