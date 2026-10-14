#!/usr/bin/env node

/**
 * Rotate ADMIN_SIGNUP_TOKEN after the initial admin bootstrap.
 *
 * Local mode updates ENV_FILE atomically (default: .env):
 *   npm run admin:rotate-token
 *
 * Render mode updates the service environment variable and triggers a deploy:
 *   RENDER_API_KEY=... RENDER_SERVICE_ID=... \
 *     npm run admin:rotate-token -- --render --confirm
 *
 * The generated token is never printed. Render mode requires --confirm because
 * it changes a live service's credentials and starts a deployment.
 */

import { randomBytes } from 'node:crypto';
import { chmod, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const renderMode = args.has('--render');
const dryRun = args.has('--dry-run');
const confirmed = args.has('--confirm');
const token = randomBytes(32).toString('base64url');
const envFile = resolve(process.env.ENV_FILE || '.env');
const renderApiBase = (process.env.RENDER_API_BASE_URL || 'https://api.render.com/v1').replace(/\/$/, '');

function fail(message) {
  console.error(`Admin token rotation failed: ${message}`);
  process.exitCode = 1;
}

function replaceEnvValue(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  return pattern.test(contents)
    ? contents.replace(pattern, line)
    : `${contents.replace(/\n?$/, '\n')}${line}\n`;
}

async function updateRenderEnv() {
  const apiKey = process.env.RENDER_API_KEY?.trim();
  const serviceId = process.env.RENDER_SERVICE_ID?.trim();
  if (!apiKey || !serviceId) {
    fail('RENDER_API_KEY and RENDER_SERVICE_ID are required with --render');
    return;
  }
  if (!confirmed && !dryRun) {
    fail('refusing live rotation without --confirm');
    return;
  }

  const envUrl = `${renderApiBase}/services/${encodeURIComponent(serviceId)}/env-vars/ADMIN_SIGNUP_TOKEN`;
  const deployUrl = `${renderApiBase}/services/${encodeURIComponent(serviceId)}/deploys`;
  if (dryRun) {
    console.log(`Dry run: would update ADMIN_SIGNUP_TOKEN on Render service ${serviceId} and trigger a deploy.`);
    return;
  }

  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${apiKey}`,
    'content-type': 'application/json',
  };
  const envResponse = await fetch(envUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ value: token }),
  });
  if (!envResponse.ok) {
    fail(`Render environment update returned HTTP ${envResponse.status}`);
    return;
  }

  const deployResponse = await fetch(deployUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ clearCache: 'do_not_clear' }),
  });
  if (!deployResponse.ok) {
    fail(`Render variable updated, but deploy trigger returned HTTP ${deployResponse.status}; deploy the service before using the new token`);
    return;
  }
  console.log(`ADMIN_SIGNUP_TOKEN rotated and deploy queued for Render service ${serviceId}.`);
}

async function updateLocalEnv() {
  if (dryRun) {
    console.log(`Dry run: would rotate ADMIN_SIGNUP_TOKEN in ${envFile}.`);
    return;
  }
  let contents = '';
  try {
    contents = await readFile(envFile, 'utf8');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const next = replaceEnvValue(contents, 'ADMIN_SIGNUP_TOKEN', token);
  const tempFile = `${envFile}.tmp-${process.pid}`;
  await writeFile(tempFile, next, { encoding: 'utf8', mode: 0o600 });
  await chmod(tempFile, 0o600);
  await rename(tempFile, envFile);
  console.log(`ADMIN_SIGNUP_TOKEN rotated in ${envFile}. Restart the API to load the new value.`);
}

try {
  if (renderMode) await updateRenderEnv();
  else await updateLocalEnv();
} catch (error) {
  fail(error instanceof Error ? error.message : 'unexpected rotation error');
}
