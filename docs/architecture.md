## Architecture notes 
### Topic: Exploration into a cross platform runtime layer for parallel execution of tasks


## Objective

Design a Cilk-like work-stealing scheduler that runs natively in the browser using Web Workers and SharedArrayBuffers. The goals:

Achieve high-performance parallelism in JS

Provide local worker deques for cache-efficient task ownership

Support stealing to balance work across threads

Minimize message passing costs

Marshal arguments using a global SAB heap

Eventually support continuations, yielding, and dynamic IR-level splitting

Penny aims to become a true micro-runtime, not just a worker pool.

## Environment Limitations

Penny is designed entirely within the constraints of browser execution:

1. Message Passing is Expensive

postMessage copies non-SAB payloads.
SAB + typed views must be used whenever possible.

2. Strict Memory Alignment Rules

JS requires typed arrays to begin on specific byte boundaries.
This constraint actually helps sab → L1/L2 cache locality.

3. No Portable Thread Stacks

Workers have no accessible stack.
No stack switching, no green threads.

4. Functions Cannot Be Sent to Workers

Closures cannot cross thread boundaries.
Workers must use a static function table.

These constraints deeply influence the design of Penny’s scheduler and memory layout.

## Memory Model

Each worker is assigned a deterministic slice of a SharedArrayBuffer:

[ Worker Metadata |
Int32 STATE |
Uint32 THREAD_ID |
Uint32 ACTIVE_TASKS (unused) |
--- padding ---
Deque Region:
Uint32 TOP |
60 bytes padding  <- avoid false sharing
Uint32 BOTTOM |
60 bytes padding
Uint32 TASK_ID * THREAD_TASK_CAPACITY
]

## Design Issues & Improvements
1. Repeated Metadata Per Worker

Better approach:

[ Global Thread Metadata |
Worker 1 Deque |
Worker 2 Deque |
...
Global Arg Heap |
Global MPMC Queue (fallback)
]

2. False Sharing Concerns

TOP and BOTTOM must be padded to at least 64 bytes.
This matches Go, Java, JVM, Rust, Cilk schedulers.

## Stack & Continuation Plans

Modern runtimes use stack switching and continuations. The main concern here, is a single heavy task monopolizing a thread. A fairness queue (not decided yet) and continuations would help avoid that. 
Java Loom, Go, Erlang, and Rust async all rely on them.

Penny v2+ Goal:

Integrate WebAssembly Stack Switching Proposal:

Green threads

Stackful fibers

True yield/resume support

Continuation passing

Cross-thread migration at yield points

IR-level yield injection

WASM modules for extensible vTables

This transforms Penny from a simple worker scheduler into a general-purpose concurrent runtime.

## Scheduler Architecture
Current Issues (v0 → v0.1)

### The initial approach:

Main thread distributes tasks

Tracks per-thread capacity

Uses fallback queues

Requires polling or timeouts

### This leads to:

UI thread stalls

Non-deterministic scheduling

Poor scaling

Main-thread bottleneck

## Proposed Architecture (v1)

There are two correct models for a real work-stealing runtime.

### Architecture A — Fully Decentralized (Recommended)

Matches Cilk, Rayon, Go, Tokio, and Kotlin coroutines.

Worker Algorithm

Try popping from bottom (fast, no atomics)

If empty → steal from another worker’s top (CAS)

If all empty → pull from global MPMC queue

If still empty → sleep using Atomics.wait

Task Injection

Main thread simply pushes tasks into the global queue.
Workers handle scheduling entirely by themselves.

Overflow Handling

If a worker’s deque is near full → spill to another worker.

### Architecture B — Dedicated Scheduler Worker

The main thread offloads scheduling to a scheduler worker that:

Distributes tasks to worker deques

Maintains optional priority queues

Performs global load balancing

Better for complex scheduling policies, but more moving parts.

## Tradeoffs
### Static Function Table

Pros

Zero-cost dispatch

Allows IR-level yield injection

Predictable symbol resolution

Easy to JIT/AOT optimize

Cons

Tasks must be defined ahead of time

No dynamic closures

Harder to load user-defined functions

Browser SAB Limitations

Requires COOP+COEP headers

Requires alignment padding

No atomic operations on 8-bit arrays except waits
