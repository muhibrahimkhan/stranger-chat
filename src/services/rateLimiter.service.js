function createBucket(capacity) {
  return { tokens: capacity, lastRefill: Date.now() };
}

function tryConsume(bucket, capacity, refillRatePerSecond) {
  const now = Date.now();
  const elapsedSeconds = (now - bucket.lastRefill) / 1000;

  const tokensToAdd = elapsedSeconds * refillRatePerSecond;
  bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

module.exports = { createBucket, tryConsume };