import { LRUCacheWithDelete } from './mnemonist/index.mjs';

const cache = new LRUCacheWithDelete(2);
cache.set('a', 1);

console.log(cache.get('a'));
