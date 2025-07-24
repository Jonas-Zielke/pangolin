import { assertEquals } from "@test/assert";
import { buildHostSniRule } from "./utils";

function runTests() {
    console.log("Running buildHostSniRule tests...");

    assertEquals(
        buildHostSniRule("tcp", "example.com"),
        "HostSNI(`example.com`)",
        "TCP with domain should use specific HostSNI"
    );

    assertEquals(
        buildHostSniRule("tcp", undefined),
        "HostSNI(`*`)",
        "TCP without domain should fallback to wildcard"
    );

    assertEquals(
        buildHostSniRule("udp", "example.com"),
        "HostSNI(`example.com`)",
        "UDP with domain should use specific HostSNI"
    );

    assertEquals(
        buildHostSniRule("udp", null),
        "HostSNI(`*`)",
        "UDP without domain should fallback to wildcard"
    );

    console.log("All tests passed!");
}

try {
    runTests();
} catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
}
