#!/usr/bin/env node
/**
 * StoreForge Platform — Universal Production Server Entry Point
 *
 * Designed for:
 * - cPanel "Setup Node.js App" (Phusion Passenger)
 * - Linux VPS (PM2, systemd, nohup, Docker-free direct execution)
 * - Bare-metal servers & Cloud Hosts (Render, Railway, Fly.io, AWS EC2, DigitalOcean)
 * - Docker / Containerized setups
 */

require('./start.js');
