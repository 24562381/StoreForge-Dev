#!/usr/bin/env node

/**
 * StoreForge Platform — Production Stop Command
 *
 * Supports:
 * - node stop
 * - node stop.js
 * - ./stop
 * - npm run stop
 * - npm stop
 * - Service flags: node stop --backend-only, --frontend-only, --admin-only
 */

require('./scripts/stop-server.js');
