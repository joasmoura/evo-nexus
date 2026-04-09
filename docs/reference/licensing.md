# Licensing

## Overview

OpenClaude includes a lightweight, privacy-first licensing system. On first setup, your instance registers once with Evolution Foundation's server. That's it — no heartbeats, no monitoring, no periodic pings.

## How It Works

### Registration

On first setup (`make setup`), your instance is silently registered with Evolution Foundation's licensing server. This happens once, automatically in the background — you don't need to enter a license key or create an account.

The registration creates a unique `instance_id` for your installation based on your machine's hardware fingerprint. This ID is stored locally in your database.

### What Data Is Sent (Once)

| Field | Description |
|-------|-------------|
| `instance_id` | Unique identifier for this installation (SHA-256 hash of hostname + MAC) |
| `email` | Admin email (from setup) |
| `name` | Admin name (from setup) |
| `version` | OpenClaude version |
| `geo` | Approximate location (country/city from IP, at registration time) |

### What It Does NOT Do

- **No heartbeats.** After registration, the system never phones home again.
- **No monitoring.** No uptime tracking, no usage telemetry, no periodic pings.
- **No feature gates.** If the licensing server is unreachable, everything works. There are no limitations, no expiration, no degraded mode.
- **No workspace data.** Your files, conversations, agent memory, financial data, and integrations are never transmitted.
- **No kill switch.** The server cannot remotely disable your instance.

## Free Tier

OpenClaude ships with a free tier that has no limitations. All agents, skills, routines, and dashboard features are available without paying anything.

The registration exists solely to help Evolution Foundation understand adoption — how many instances exist and where — which informs development priorities.

## Licensing API

The licensing server exposes an API that the `int-licensing` skill queries for aggregated telemetry data. This is used by the daily and weekly licensing routines to generate open source growth reports:

- Total registered instances
- Geographic distribution
- Version adoption rates

These reports help track the health and growth of the open source ecosystem.

## Configuration

Licensing is configured automatically during `make setup`. You don't need to configure anything manually.

To check your licensing status, use the dashboard's Integrations page or run:

```bash
make licensing
```
