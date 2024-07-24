export interface BucketsStorageInterface {
  getClientBucket(clientId: string): ClientTokenBucket | undefined;
  setClientBucket(clientTokenBucket: ClientTokenBucket): void;
  refillTokens(tokensAdded: number, bucketSize: number): void;
  listBuckets(): Array<[string, number]>;
  decreaseTokens(clientId: string): void;
}

export type ClientTokenBucket = {
  clientId: string;
  availableTokens: number;
};

export default class BucketsStorageMemory implements BucketsStorageInterface {
  private tokenBuckets: Map<string, number> = new Map();

  public getClientBucket(clientId: string): ClientTokenBucket | undefined {
    if (this.tokenBuckets.has(clientId)) {
      return {
        clientId: clientId,
        availableTokens: this.tokenBuckets.get(clientId) as number,
      };
    }
  }

  public setClientBucket(clientTokenBucket: ClientTokenBucket) {
    this.tokenBuckets.set(clientTokenBucket.clientId, clientTokenBucket.availableTokens);
  }

  public refillTokens(tokensAdded: number, bucketSize: number) {
    this.tokenBuckets.forEach((tokens, clientId) => {
      this.tokenBuckets.set(clientId, Math.min(tokens + tokensAdded, bucketSize));
    });
  }
  public listBuckets() {
    return Array.from(this.tokenBuckets.entries());
  }

  public decreaseTokens(clientId: string) {
    if (this.tokenBuckets.has(clientId)) {
      this.tokenBuckets.set(clientId, (this.tokenBuckets.get(clientId) as number) - 1);
    }
  }
}
