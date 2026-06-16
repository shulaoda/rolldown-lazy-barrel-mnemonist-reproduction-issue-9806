// Minimal working LRU cache so the expected program prints `1`.
// `module.exports = LRUCacheWithDelete` mirrors mnemonist's CommonJS sub-modules,
// which is what produces `import_lru_cache_with_delete.default` in the bundle.
function LRUCacheWithDelete(capacity) {
  this.capacity = capacity || Infinity;
  this.items = new Map();
}

LRUCacheWithDelete.prototype.set = function (key, value) {
  if (this.items.has(key)) {
    this.items.delete(key);
  } else if (this.items.size >= this.capacity) {
    this.items.delete(this.items.keys().next().value);
  }
  this.items.set(key, value);
};

LRUCacheWithDelete.prototype.get = function (key) {
  if (!this.items.has(key)) return undefined;
  const value = this.items.get(key);
  this.items.delete(key);
  this.items.set(key, value);
  return value;
};

module.exports = LRUCacheWithDelete;
