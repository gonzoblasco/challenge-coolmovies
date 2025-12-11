// This polyfill is needed because Redux 5 and Redux Observable have a mismatch
// in their expectation of Symbol.observable definition.
// We use Symbol.for('observable') to ensure that if multiple polyfills run,
// or if different realms are involved, they resolve to the same Symbol.

if (typeof Symbol.observable === 'undefined') {
  Object.defineProperty(Symbol, 'observable', {
    value: Symbol.for('observable'),
  });
}

export {};
