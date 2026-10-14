import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { Browser, Page } from 'puppeteer-core';

const DEFAULT_EXECUTABLE = '/usr/bin/chromium';
const MAX_CONTENT_BYTES = 220 * 1024;

@Injectable()
export class ResumeExportService {
  constructor(private readonly config: ConfigService) {}

  async renderPdf(
    content: Record<string, unknown>,
    isPro = false,
  ): Promise<Buffer> {
    const serializedContent = JSON.stringify(content || {});
    if (Buffer.byteLength(serializedContent, 'utf8') > MAX_CONTENT_BYTES) {
      throw new ServiceUnavailableException(
        'resume content is too large to export',
      );
    }

    const renderUrl = String(
      this.config.get('client_url') ||
        process.env.EXPORT_RENDER_URL ||
        'http://localhost:3001',
    ).replace(/\/$/, '');
    const storage = JSON.stringify({
      auth: JSON.stringify({ access_token: null, isPro: Boolean(isPro) }),
      resume: JSON.stringify(content || {}),
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
    });
    let browser: Browser | undefined;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || DEFAULT_EXECUTABLE,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
        timeout: 30_000,
      });
      const page = await browser.newPage();
      await this.configurePage(page, new URL(renderUrl).origin, storage);
      await page.goto(`${renderUrl}/resume/create?export=1`, {
        waitUntil: 'networkidle0',
        timeout: 45_000,
      });
      await page.waitForSelector('#resume-print-root', { timeout: 15_000 });
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(undefined)),
        );
      });
      await page.emulateMediaType('print');
      return Buffer.from(
        await page.pdf({
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: false,
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'unknown export error';
      throw new ServiceUnavailableException(`resume export failed: ${message}`);
    } finally {
      await browser?.close();
    }
  }

  private async configurePage(
    page: Page,
    allowedOrigin: string,
    storage: string,
  ) {
    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      try {
        const parsed = new URL(url);
        if (
          !['http:', 'https:'].includes(parsed.protocol) ||
          parsed.origin !== allowedOrigin
        ) {
          return request.abort();
        }
      } catch {
        return request.abort();
      }
      if (['websocket', 'manifest', 'media'].includes(request.resourceType()))
        return request.abort();
      return request.continue();
    });
    await page.evaluateOnNewDocument((persistedRoot) => {
      window.localStorage.setItem('persist:root', persistedRoot);
    }, storage);
  }
}
