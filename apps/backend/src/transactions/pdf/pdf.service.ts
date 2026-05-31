import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

interface PdfOptions {
  format?: 'A4' | 'A5';
  landscape?: boolean;
}

@Injectable()
export class PdfService {
  async generateFromHtml(html: string, options: PdfOptions = {}): Promise<Buffer> {
    const { format = 'A5', landscape = false } = options;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format,
        landscape,
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
