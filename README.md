# Penny

OUTDATED. TODO: Update to latest 

Penny is an experiment in building a Cilk-style work-stealing scheduler for the browser using Web Workers, dynamic vtables, and user-level task scheduling.

Modern browsers expose concurrency primitives (Workers, SharedArrayBuffers, Atomics) but lack traditional OS-level features like stacks, preemption, and direct yield control. Penny asks:

**What would a proper parallel runtime for the browser look like if we tried to build it anyway?**

This repository explores the constraints and possibilities of:

- virtualized threads (host-agnostic thread abstraction)
- dynamic function dispatch
- dependency-driven execution
- future WASM stack switching
- hybrid browser-native + WASM scheduling

---

##  Why Penny Exists

Today, browser compute is single-thread–biased, message-passing–only, and lacks the foundations needed for real parallel runtimes. However:

- client-side ML workloads are increasing
- games & simulations are moving into WASM
- heavy UI apps want parallel pipelines
- multi-tab or multi-client distributed compute is possible

**Penny is a research experiment to answer a simple question:**  
*Can a browser runtime behave more like an OS scheduler?*  
If so, what abstractions are required, and how far can we push Web Workers under these constraints?

The goal is not to fully reproduce Cilk or Go, but to understand the engineering surface:  
shared memory, work-stealing, fibers, fake stacks, async yielding, dependency graphs — and how they behave in a sandboxed world.

---

##  Current State — v1

This repository currently contains the first slice of the scheduler:

- a static/dynamic vtable
- virtual thread abstraction
- random scheduling (initial prototype)
- thread state transitions (Sleeping → Running)
- callback-based task completion

Architecture notes and design decisions live in:

- `/docs/architecture.md`
- `/docs/dev_thoughts.md`
- `/docs/experimental/` (design sketches, thought experiments, alternative models)

---

##  Current Data Flow (v1)

![Scheduler Flow](./diagrams/penny-v1.png)

---

##  Use Cases (Future-facing)

Penny is research-oriented, but the end-state runtime could support:

### **Parallel client-side compute**
- ML inference inside a webpage
- large dataset transforms
- video processing / compression
- physics simulations
- pathfinding or game logic in workers

### **Hybrid WASM + JS runtimes**
- a WASM core with vtable dispatch into JS
- JS tasks calling into WASM fibers
- scheduling workloads across both boundaries

### **Structured parallelism inside apps**
- “spawn / sync” style APIs for UI workloads
- async graphs that respect data dependencies
- mini-DAG executors for pipeline tasks

### **Distributed workloads**
(ambitious, long-term idea)

Imagine a tab → tab → device → device virtual thread pool:

- serialize tasks
- send them to other clients
- run atomic microtasks
- aggregate results
- behave like a global cooperative cluster

---

##  Roadmap

###  v2 Goals
- Thread state machine: Idle | Running | Blocked
- Deterministic scheduling (round-robin)
- Per-thread task deques
- Work-stealing prototype (Cilk-style)
- Basic dependency graph support (mini-DAG executor)
- Name-mangled function registry (hash → function mapping)

###  v3 Goals
- WASM core scheduler
- WASM stack switching → shallow fibers
- Pluggable thread backend: Browser / Node / WASM host

###  v4 Vision
- Multi-node distributed scheduling
- Serialized microtasks + atomic execution units
- Virtual global thread pool across clients

---

## Experimental Designs

All alternative designs (e.g., MGR — Merry Go Round Scheduler, userland fake stacks, multi-queue experiments) live in: /docs/experimental

