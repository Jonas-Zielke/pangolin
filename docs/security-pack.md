# Security Pack

The Security Pack provides optional firewall protections that can be enabled from `config.yml` or the web interface.

## Options

- **SYN Flood Protection** – Adds iptables rules to mitigate SYN flood attacks.
- **ICMP Rate Limit** – Limits the rate of ICMP packets accepted per second.

Edit `config/config.yml` under the `security_pack` section:

```yaml
security_pack:
    syn_flood_protection: false
    icmp_rate_limit: 10
```

After adjusting these settings restart the server or use the API endpoints under `/security` to apply changes at runtime.
