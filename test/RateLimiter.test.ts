import BucketsStorageMemory from "../BucketsStorage";
import { RateLimiter, RateLimiterMessage, RateLimitError, RateLimitsConfig } from "../RateLimiter";

test("Should create a rate limiter with given configuration", () => {
  const config: RateLimitsConfig  = {
    bucketSize: 10,
    refillRate: 2000,
    tokensAdded: 2,
    bucketsStorage: new BucketsStorageMemory()
  };
  const rateLimiter = new RateLimiter(config);
  expect(rateLimiter.configDetails).toEqual(config);
  rateLimiter.stopRefill();
});

test("Should validate a request and return ACCEPTED message if tokens are available for client", () => {
  const config: RateLimitsConfig  = {
    bucketSize: 10,
    refillRate: 2000,
    tokensAdded: 2,
    bucketsStorage: new BucketsStorageMemory()
  };
  const rateLimiter = new RateLimiter(config);
  expect(rateLimiter.validateRequest("1234")).toEqual({ message: RateLimiterMessage.ACCEPTED });
  rateLimiter.stopRefill();
});

test("Should validate a request and return REJECTED message if no tokens are available for client", () => {
  const config: RateLimitsConfig  = {
    bucketSize: 3,
    refillRate: 2000,
    tokensAdded: 2,
    bucketsStorage: new BucketsStorageMemory()
  };
  const rateLimiter = new RateLimiter(config);
  rateLimiter.validateRequest("1234");
  rateLimiter.validateRequest("1234");
  rateLimiter.validateRequest("1234");
  expect(() => {
    rateLimiter.validateRequest("1234");
  }).toThrow(new RateLimitError(RateLimiterMessage.REJECTED));
  rateLimiter.stopRefill();
});

// Not ideal as is relies on setTimeout
test.skip("Should refill tokens for all clients according to refill interval", async () => {
  const config: RateLimitsConfig  = {
    bucketSize: 6,
    refillRate: 1000,
    tokensAdded: 2,
    bucketsStorage: new BucketsStorageMemory()
  };
  const rateLimiter = new RateLimiter(config);
  for (let i = 0; i < 6; i++) {
    rateLimiter.validateRequest("1234");
    rateLimiter.validateRequest("5678");
  }
  await new Promise((resolve) => setTimeout(resolve, 4000));
  expect(rateLimiter.bucketsList).toEqual([["1234", 6], ["5678", 6]]);
  rateLimiter.stopRefill();
});