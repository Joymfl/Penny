## Notes and understanding about Chase-Lev
So, my choice of method for implementing the work stealing scheduler, is to maintain a local task deque in each thread. 
But, as mentioned in [[architecture.md]], this won't work because browser environment doesn't give me access to thread stacks, and thread x cannot look 
into the memory of thread y. But the concept still stands.

Thief Thread                                      Owning thread
        |                                        |
        | -> [Task 1, Task 2, Task 3, Task 4] <- |
                |                       |
                Top                     Bottom

The above diagram is the gist of my understanding of it. The core of the algorithm, is what's called a `dynamic-cyclic-array`. The only issue being that 
they use mathematical integers, which essentially means, they're not worried about integer overflow in the language environment, which limits the deque size. 
I'll need a way to invalid the queue size (or at least block new requests from coming in to it), if it even comes close to th e integer max size

They also mention this: ```A 64-bit integer is large enough to accommodate
64 years of pushes, pops, and steals executing at a rate of
4 billion operations per second, so it appears that this will
not be a problem in practice.```, so I guess Penny would be fine for a few years (TODO: Still find a solution for it)


Also, working with SAB constraints (Noted in the architecture docs), it makes it hard ot use the algorithm to a T. Because, they expect the Deque to be able to grow, if the pushed item is out of bounds of the deque, which is not possible given the choice of using SABs.
I'll solve this by having a global buffer of tasks, that will wait for the Deque to shrink

The **key** insight of this Chase-Lev model (which blew my mind), is that the modulo formula is treated as a mapping from infinite indices into physical indices. 



### Other algorithms considered
ABP algorithm -> issue with memory overflow
Hendler,Lev and Shavit -> Didn't understand it intuitively (Note: Read on it again)