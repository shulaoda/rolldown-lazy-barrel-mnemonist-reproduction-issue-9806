# rolldown lazy-barrel mnemonist reproduction (issue #9806)

Minimal reproduction for [rolldown/rolldown#9806](https://github.com/rolldown/rolldown/issues/9806): with the default `experimental.lazyBarrel: true`, a side-effect-free barrel that derives re-export values from an imported default produces a bundle that throws `ReferenceError: FibonacciHeap is not defined` at module evaluation time.

## Reproduce

```sh
npm install
npm run build
npm run start
```

Expected output is `1`. Actual output:

```txt
FibonacciHeap.MinFibonacciHeap;
^
ReferenceError: FibonacciHeap is not defined
```

## The barrel

`mnemonist/index.mjs` is a side-effect-free ESM barrel (modeled on `mnemonist@0.40.4`) that imports a default from a CommonJS sub-module and derives a named re-export from a property on it. `entry.mjs` only imports `LRUCacheWithDelete`, never `FibonacciHeap`.

```js
import { default as FibonacciHeap } from './fibonacci-heap.js'; // CommonJS
const MinFibonacciHeap = FibonacciHeap.MinFibonacciHeap;        // derived, unused by entry
export { FibonacciHeap, MinFibonacciHeap };
export { default as LRUCacheWithDelete } from './lru-cache-with-delete.js'; // CommonJS
```

## Suspected cause: inconsistent tree-shaking / DCE of `sideEffects: false`

The bug is the interaction of two passes that each treat the barrel's `sideEffects: false` promise differently. Tree-shaking keeps the derived initializer as a bare side-effect statement `FibonacciHeap.MinFibonacciHeap;` (it treats the property read as potentially side-effectful, a getter), even though the binding `MinFibonacciHeap` is unused and the module is declared side-effect-free. At the same time `lazyBarrel`, trusting that same `sideEffects: false`, prunes the `./fibonacci-heap.js` import entirely (the module is never bundled, the import binding is never linked). The statement survives but the import that defines `FibonacciHeap` is gone, so the reference dangles.

In other words, DCE does not honor `sideEffects: false` consistently at the statement level. If the unused derived initializer were dropped (as it already is when every module in the graph is ESM, and as webpack does for this exact case), `lazyBarrel`'s pruning would be sound. So the suspected fix is to make statement-level DCE consistent with the module's `sideEffects: false` declaration, rather than to make `lazyBarrel` smarter.

This bundle output side-by-side makes the inconsistency clear (`lazyBarrel: false` keeps the statement AND the import; `lazyBarrel: true` keeps the statement but drops the import):

```js
// lazyBarrel: false (works)  -> import_fibonacci_heap.default.MinFibonacciHeap;  + the module is bundled
// lazyBarrel: true  (throws) -> FibonacciHeap.MinFibonacciHeap;                  + the module is gone
```

## Minimal trigger conditions

Each of these was confirmed necessary by reduction; dropping any one makes the bundle run correctly. The barrel is side-effect-free; the barrel reads a property of an imported default (`const X = Default.prop`, a plain identifier copy does not trigger it); `entry.mjs` reaches the barrel through a re-export from a CommonJS module (an ESM re-export, or a local export of the barrel, does not trigger it); and `entry.mjs` imports only that re-export, never the default whose property is read.

## Workaround

Set `experimental: { lazyBarrel: false }` in `rolldown.config.mjs` (the block is present but commented out). The same bundle then runs and prints `1`.
