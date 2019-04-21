---
name: typescript-async
layout: post
title: A quick example of async/await
time: 2019-4-20 19:30:00 -07:00
category: Tutorial
tags:
  - typescript
  - javascript
  - async
  - promise
---

_Note: all the code in this post is in TypeScript._

Suppose we want to implement the following function:
`function retry<T>(action: () => Promise<T>, n: number): Promise<T>` such
that it preforms the action and retrieves the value and retries up to
n times, if the action fails.

Had `action` been a synchronous function, it may be natural to use a for loop,
which is easy to write and pretty readable. But we can't use a for loop with
asynchronous code - or can we?

Enter the `async/await` keywords. You can mark a function as `async` which
makes the function always return a promise wrapping its last execution
statement. It also allows the `await` keyword within the body which makes
JavaScript wait for the execution of the promise, then unwraps it so that
it's assignable, before proceeding to the next statement. If the promise
fails, it will also trigger an exception which can be handled in a `try { }`
block.

So the above function can be implemented as

```typescript
async function retry<T>(action: () => Promise<T>, n: number): Promise<T> {
    for (let i = 0; i < n; i++) {
        try {
            return await action();
        } catch(e) {

        }
    }
}
```

Note that `await` only pauses the execution of the function. If the action
is also not blocking (e.g. if it's an asynchronous network request), using `await`
doesn't cause the whole program to pause. This means that we can continue to issue
other asynchronous requests while waiting for this particular action.

We can extend this function further. Suppose we want to add some exponential
backoff logic - run immediately, then wait `w` milliseconds if it fails
before retrying, then wait `w * 2` milliseconds before the next try if it
fails again, and so on. This can be done by first implementing a `sleep`
promise:

```typescript
async function sleep(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}
```

Note that the `async` keyword is unnecessary here since we are not using any
`await` keywords within the function, and we are already returning a promise.

With this function we can augment our `retry` function like so:

```typescript
async function retry<T>(action: () => Promise<T>, n: number, w: number): Promise<T> {
    let backoff = w;
    for (let i = 0; i < n; i++) {
        try {
            return await action();
        } catch(e) {

        }
        sleep(backoff);
        backoff *= 2;
    }
}
```

Again `sleep` which relies on `setTimeout` is non-blocking so calling `sleep` only
pauses the execution of the function.

As you can see, `async/await` makes it a lot easier to write readable and
succinct asynchronous code. Just keep in mind that JavaScript is still single
threaded so only those `await`-ed functions are _possibly_ non-blocking.
