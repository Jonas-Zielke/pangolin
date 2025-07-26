import { CommandModule } from "yargs";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import Database from "better-sqlite3";

function getRawPorts(dbPath: string): { protocol: string; port: number }[] {
    if (!fs.existsSync(dbPath)) {
        return [];
    }
    try {
        const db = new Database(dbPath, { readonly: true });
        const rows = db
            .prepare(
                "SELECT DISTINCT lower(protocol) as protocol, proxyPort FROM resources WHERE proxyPort IS NOT NULL AND http = 0"
            )
            .all() as { protocol: string; proxyPort: number }[];
        return rows.map((r) => ({ protocol: r.protocol, port: r.proxyPort }));
    } catch {
        return [];
    }
}

function updateTraefikConfig(configPath: string, ports: { protocol: string; port: number }[]) {
    if (!fs.existsSync(configPath) || ports.length === 0) {
        return;
    }
    const data = fs.readFileSync(configPath, "utf8");
    const config = (yaml.load(data) as any) || {};
    config.entryPoints = config.entryPoints || {};
    for (const { protocol, port } of ports) {
        const name = `${protocol}-${port}`;
        config.entryPoints[name] = { address: `:${port}/${protocol}` };
    }
    fs.writeFileSync(configPath, yaml.dump(config), "utf8");
}

function addPortsToService(service: any, ports: { protocol: string; port: number }[]) {
    if (!service) return;
    service.ports = service.ports || [];
    const existing = new Set(service.ports as string[]);
    for (const { protocol, port } of ports) {
        const p = `${port}:${port}${protocol === "tcp" ? "" : "/" + protocol}`;
        if (!existing.has(p)) {
            service.ports.push(p);
        }
    }
}

function updateComposeFile(filePath: string, ports: { protocol: string; port: number }[]) {
    if (!fs.existsSync(filePath) || ports.length === 0) {
        return;
    }
    const data = fs.readFileSync(filePath, "utf8");
    const compose = (yaml.load(data) as any) || {};
    const services = compose.services || {};
    let target = services.traefik;
    if (target && typeof target.network_mode === "string" && target.network_mode.startsWith("service:")) {
        const svc = target.network_mode.split(":" )[1];
        target = services[svc];
    }
    addPortsToService(target, ports);
    fs.writeFileSync(filePath, yaml.dump(compose), "utf8");
}

export const updateTraefikEntryPoints: CommandModule = {
    command: "update-traefik-entrypoints",
    describe: "Update traefik_config.yml and docker compose files with entryPoints for raw resource ports",
    handler: () => {
        const dbPath = path.join("config", "db", "db.sqlite");
        const ports = getRawPorts(dbPath);
        if (ports.length === 0) {
            console.log("No raw resource ports found");
            return;
        }
        updateTraefikConfig(path.join("config", "traefik", "traefik_config.yml"), ports);
        updateComposeFile("docker-compose.example.yml", ports);
        updateComposeFile(path.join("install", "config", "docker-compose.yml"), ports);
        console.log("Traefik entryPoints updated");
    }
};
