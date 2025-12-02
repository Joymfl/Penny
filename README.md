# Penny Runtime
### A browser-native, Cilk-inspired work-stealing runtime for parallel execution

Penny is an experimental **parallel runtime** designed to bring **Cilk-style work-stealing**, **zero-copy shared memory**, and **future fiber support** to the browser and other JavaScript environments.

It explores what a true **low-level scheduler** could look like in a world constrained by:

- Web Workers
- SharedArrayBuffers
- TypedArray alignment
- Atomics
- No thread stacks or closures across workers

Penny is not a worker pool — it is a **research runtime** that pushes the boundaries of what JavaScript can do on multicore hardware.

---

## 🚀 Features (Current + In Progress)

- **Local worker deques** backed by SharedArrayBuffers
- **Work stealing** using atomic CAS operations
- **Avoids expensive message passing** using typed SAB views
- **Cross-thread task execution** with a static function table
- **Zero-copy argument marshalling (planned)**
- **WASM stack switching + continuation support (v2+)**
- **Dynamic IR-level yield injection (future)**
- **Decentralized scheduling architecture (Cilk-like)**

---

## 📦 Quick Start (Prototype Example)

```ts
import { Scheduler } from "./scheduler";

const scheduler = new Scheduler(4); // 4 worker threads

// define the function table ahead of time. as in /src/worker/worker.js

scheduler.newTask(1, [40, 2]);  // => 42
```

🧠 Why Penny Exists

Modern runtimes like Cilk, Go, Tokio, Rayon, and Java Loom all rely on:

Local work queues

Work stealing

Cooperatively yielding tasks

Continuations or virtual threads

Stack or fiber switching

Fast shared memory

JavaScript has none of these — yet all major platforms (browsers, Node, Deno, Bun) now support:

Web Workers / Worker Threads

SharedArrayBuffers

Atomics

WebAssembly

Proposed WASM stack switching

Module-level isolation and loading

Penny explores whether a real multicore scheduler can be built using only these primitives.

## Architecture Overview (High-Level)

Each worker has a dedicated SAB slice containing:

State

Identifiers

Top/Bottom deque pointers

A ring buffer for tasks

Workers run an infinite loop:

Pop from bottom (fast path)

If empty → steal from another worker’s top

If all empty → check global MPMC queue

If still empty → Atomics.wait()

Main thread only injects tasks; it does not schedule them

Future versions may move scheduling into a dedicated "scheduler worker"

📄 Full details:
👉 docs/architecture.md

## Status

Penny is experimental and rapidly evolving.
Not intended for production use.