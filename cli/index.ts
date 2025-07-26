#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { setAdminCredentials } from "@cli/commands/setAdminCredentials";
import { updateTraefikEntryPoints } from "@cli/commands/updateTraefikEntryPoints";

yargs(hideBin(process.argv))
    .scriptName("pangctl")
    .command(setAdminCredentials)
    .command(updateTraefikEntryPoints)
    .demandCommand()
    .help().argv;
