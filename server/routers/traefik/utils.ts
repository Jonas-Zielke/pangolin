export function buildHostSniRule(
    protocol: string,
    fullDomain?: string | null
): string | undefined {
    if (protocol !== "tcp" && protocol !== "udp") {
        return undefined;
    }
    const domain = fullDomain ?? "*";
    return `HostSNI(\`${domain}\`)`;
}
