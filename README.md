# PHOENIX-RP

PHOENIX-RP is a custom FiveM core developed for the PHOENIX-RP server. Inspired by QBCore, PHOENIX-RP provides a lightweight, modular foundation for building roleplay servers with a clean event and export-based API, player management, inventory/account systems, and an easy-to-extend resource architecture.

> NOTE: This README is a general, practical guide. If you want it tailored to the exact files and scripts in this repository (commands, exports, SQL schema), tell me which files to reference or grant read access and I will update the docs to match the code.

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Resource Integration (for developers)](#resource-integration-for-developers)
- [Common Commands & Events](#common-commands--events)
- [Data & Database](#data--database)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Credits & License](#credits--license)

## Features
- Modular core for resources to depend on
- Player session management (login, identifiers, basic save/load)
- Inventory and account placeholders (easy to adapt to your DB)
- Event-driven API inspired by QBCore conventions
- Clear separation of server/client responsibilities
- Designed to be easy to extend for jobs, housing, vehicles, etc.

## Requirements
- A running FiveM server (FXServer)
- Basic familiarity with FiveM resources and server.cfg
- A supported MySQL connector (recommended: oxmysql or ghmattimysql)
- Lua (FiveM resource scripts)
- Node.js or other tools only if your repo contains build steps — otherwise not required

Recommended:
- oxmysql (fast and actively maintained)
- A modern FiveM server release channel

## Quick Start (deploy to your server)
1. Clone the repository into your server's `resources` folder:
   git clone https://github.com/Choy0X/PHOENIX-RP.git phoenix-core

2. Install a MySQL connector on your server (choose one):
   - oxmysql: https://github.com/overextended/oxmysql
   - ghmattimysql: https://github.com/GHMatti/ghmattimysql

3. Add PHOENIX-RP to your `server.cfg` and ensure it starts before other resources that depend on it:
   ensure phoenix-core
   -- then your other resources
   ensure phoenix-jobs
   ensure phoenix-inventory

4. Configure database connection in the connector config (eg. `oxmysql` config) and set any server variables in `config.lua` or `.env` if present.

5. Start the server and watch the logs for the core initializing.

## Configuration
Place server-specific settings in the repository's config file(s). Typical settings:
- Database connection info (in your MySQL connector config)
- Core settings in `config.lua` (example keys: locale, debugMode, coreName)
- Permissions/roles mapping if your server uses role-based admin tools

If you have a `config.lua`:
- Open `config.lua` and update values for your environment
- Restart or refresh the resource after changes: `refresh` then `ensure phoenix-core` or `restart phoenix-core`

## Resource Integration (for developers)
PHOENIX-RP exposes conventions that other resources should follow:

- fxmanifest example (resource depending on PHOENIX-RP):
  (Place this in dependent resource's fxmanifest.lua)
  ```lua
  dependency 'phoenix-core' -- make sure the core name matches the resource folder name
  ```

- Accessing core exports and events:
  - Exports (example pattern):
    exports['phoenix-core']:GetPlayer(sourceOrIdentifier)
  - Server events (example pattern):
    TriggerEvent('phoenix:server:someAction', args)
    TriggerClientEvent('phoenix:client:someNotification', targetPlayer, data)

Note: The actual export and event names in your code may differ; check the core scripts if you want exact signatures.

## Common Commands & Events
(Example names — update to match your code)
- Server-side:
  - phoenix:server:playerLoaded — fired when a player finishes loading
  - phoenix:server:savePlayer — persist player data to DB
- Client-side:
  - phoenix:client:notify — displays a notification to the player
- Exports:
  - GetPlayer(identifier) — returns player object
  - RegisterItem(itemDefinition) — register an item to the core inventory

If you want, I can scan your repo and insert the exact command/event list automatically.

## Data & Database
- Place any SQL schema or seed files in a `/sql` or `/database` folder.
- Typical tables: players, characters, inventories, accounts, roles
- Use prepared statements and connection pooling provided by your chosen connector (oxmysql or ghmattimysql).
- Backup your database regularly, especially before running schema changes.

## Troubleshooting
- “Core not found” on server start: ensure `ensure phoenix-core` appears before dependent resources in `server.cfg`.
- Database connection errors: check your connector config and that the MySQL server allows connections from your FXServer host.
- Exports return nil: confirm resource names in fxmanifest and that the core resource is started.

## Contributing
This repo began as a personal project for PHOENIX-RP. If you want to contribute:
1. Fork the repository
2. Create a branch for your feature
3. Submit a pull request with a clear description and any breaking changes
4. Include SQL migrations and test steps for database changes

If you'd like, I can draft a CONTRIBUTING.md and a template PR checklist.

## Credits & Inspiration
- Built and maintained by Choy0X (owner of the PHOENIX-RP repo)
- Inspired by QBCore and other community FiveM cores
- Thanks to the FiveM community and open-source contributors
