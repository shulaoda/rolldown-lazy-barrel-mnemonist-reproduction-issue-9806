/**
 * Minimal, side-effect-free ESM barrel modeled on `mnemonist@0.40.4`'s
 * `index.mjs`: it imports a default from a CommonJS sub-module and derives a
 * named re-export value from a property on that default.
 */
import { default as FibonacciHeap } from './fibonacci-heap.js';
const MinFibonacciHeap = FibonacciHeap.MinFibonacciHeap;

export { FibonacciHeap, MinFibonacciHeap };
export { default as LRUCacheWithDelete } from './lru-cache-with-delete.js';
