# Rate Limit Store

Pangolin can persist rate limit counters using Redis or the primary database. By default a memory store is used.

Add a `redis` section and choose the store type in `config.yml`:

```yaml
redis:
    connection_string: redis://localhost:6379

rate_limits:
    store: redis
```

To use the database instead:

```yaml
rate_limits:
    store: database
```

If the table does not exist it will be created automatically when the server starts.
