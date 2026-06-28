// Minimal service worker — pass through all fetch requests, no caching.
// Explicitly excludes /auth/* and /api/* from any future cache rules.
self.addEventListener("fetch", (event) => {
  // No-op: let all requests pass through to the network.
});
