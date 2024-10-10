import type { BucketsStorageInterface, ClientTokenBucket } from './BucketsStorage';

export enum RateLimiterMessage {
  ACCEPTED = 'Accepted request: enough tokens',
  REJECTED = 'Rejected request: not enough tokens',
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * @refillRate in milliseconds.
 * @bucketSize maximum number of tokens in a bucket.
 * @tokensAdded number of tokens added to a bucket on each refill.
 */
export type RateLimitsConfig = {
  bucketSize: number;
  tokensAdded: number;
  refillRate: number;
  bucketsStorage: BucketsStorageInterface;
};

export class RateLimiter {
  private bucketsStorage: BucketsStorageInterface;
  private config: RateLimitsConfig;
  private refillIntervalId: NodeJS.Timeout | null;

  constructor(config: RateLimitsConfig) {
    this.bucketsStorage = config.bucketsStorage;
    this.config = config;
    // setInteval must be bound to "this" because it's always called in global scope
    this.refillIntervalId = setInterval(this.refillTokens.bind(this), this.config.refillRate);
  }

  public validateRequest(clientId: string): { message: string } {
    let clientBucket = this.bucketsStorage.getClientBucket(clientId);
    if (!clientBucket) clientBucket = this.initializeClientBucket(clientId);
    if (clientBucket.availableTokens > 0) {
      this.bucketsStorage.decreaseTokens(clientId);
      return { message: RateLimiterMessage.ACCEPTED };
    }
    throw new RateLimitError(RateLimiterMessage.REJECTED);
  }

  private initializeClientBucket(clientId: string) {
    const clientBucket: ClientTokenBucket = {
      clientId: clientId,
      availableTokens: this.config.bucketSize,
    };
    this.bucketsStorage.setClientBucket(clientBucket);
    return clientBucket;
  }

  private refillTokens() {
    this.bucketsStorage.refillTokens(this.config.tokensAdded, this.config.bucketSize);
  }

  get bucketsList() {
    return this.bucketsStorage.listBuckets();
  }

  get configDetails() {
    return this.config;
  }

  public stopRefill() {
    if (this.refillIntervalId) {
      clearInterval(this.refillIntervalId);
      this.refillIntervalId = null;
    }
  }
}
