#!/usr/bin/env node

/**
 * Create the first KungaCV administrator through the protected /admin/signup
 * endpoint. This is intentionally a one-shot operational helper: provide all
 * secrets through environment variables, not command-line arguments.
 *
 * Required environment variables:
 *   ADMIN_SIGNUP_TOKEN  value configured on the API
 *   ADMIN_EMAIL         administrator email address
 *   ADMIN_PASSWORD      administrator password
 *
 * Optional environment variables:
 *   ADMIN_NAME          display name (default: KungaCV Administrator)
 *   API_URL             API origin (default: http://localhost:3000)
 *
 * Usage:
 *   ADMIN_SIGNUP_TOKEN=... ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *     node scripts/bootstrap-admin.mjs
 *
 * Add --dry-run to validate configuration without making a request.
 */

const required = ['ADMIN_SIGNUP_TOKEN', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const dryRun = process.argv.includes('--dry-run');
const apiUrl = (process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '');
const name = process.env.ADMIN_NAME || 'KungaCV Administrator';

function fail(message) {
  console.error(`Admin bootstrap failed: ${message}`);
  process.exitCode = 1;
}

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  fail(`missing required environment variable(s): ${missing.join(', ')}`);
} else {
  let endpoint;
  try {
    endpoint = new URL('/admin/signup', apiUrl);
  } catch {
    fail('API_URL must be a valid absolute URL');
  }

  if (endpoint && !/^https?:$/.test(endpoint.protocol)) {
    fail('API_URL must use http or https');
  }

  if (endpoint && !process.exitCode) {
    const request = {
      name,
      email: process.env.ADMIN_EMAIL.trim(),
      password: process.env.ADMIN_PASSWORD,
    };

    if (dryRun) {
      console.log(`Dry run: would POST ${endpoint.href} for ${request.email}`);
      console.log('Credentials were validated and will not be sent.');
    } else {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-admin-signup-token': process.env.ADMIN_SIGNUP_TOKEN,
          },
          body: JSON.stringify(request),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message =
            typeof body.message === 'string'
              ? body.message
              : Array.isArray(body.message)
                ? body.message.join('; ')
                : `HTTP ${response.status}`;
          fail(message);
        } else {
          const user = body.user || {};
          console.log(`Admin created: ${user.email || request.email}`);
          if (user.uid) console.log(`UID: ${user.uid}`);
          console.log('Sign in through /admin/login. The access token is not printed.');
        }
      } catch (error) {
        fail(error instanceof Error ? error.message : 'request could not be completed');
      }
    }
  }
}
