<!-- write reademe for project -->
# Simple Rate Limiter

This is a simple rate limiter that can be used to limit the number of requests to a service. It is implemented using a token bucket algorithm.
The rate limiter configuration is passed when creating the rate limiter object. The configuration includes the bucket size, tokens added per interval, the interval between
buckets refills and a bucket storage interface.

In this implementation, the bucket storage interface is an in-memory storage that stores the bucket in a map. Feel free to implement your own storage interface with your own storage mechanism or Redis.
After installing dependencies `npm install`, you can run the test suite with `npx jest`.
