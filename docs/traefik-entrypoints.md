# Traefik EntryPoints

Pangolin uses Traefik as its reverse proxy. Each TCP or UDP port that you want to expose must be declared as an `entryPoint` in `config/traefik/traefik_config.yml`.

## Declaring Ports

Edit `config/traefik/traefik_config.yml` and add the desired port under the `entryPoints` section. The name of the entryPoint should follow the pattern `<protocol>-<port>`. For example, to expose port `443` for TCP you would add:

```yaml
entryPoints:
  tcp-443:
    address: ":443"
```

After declaring the entryPoint, resources using this port can reference it automatically.

## Multiple TCP Services on One Port

When using SNI (Server Name Indication), Pangolin can now host multiple TCP services on the same port. Each service is routed based on the requested host name, allowing several TLS-enabled applications to share a single port.
