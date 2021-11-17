import { renderToStaticMarkup } from "react-dom/server";
import chromium from 'chrome-aws-lambda';
import { chromium as devChromium } from "playwright";
import playwright from 'playwright-core';

import normalizeCSS from "./normalized";
 
async function printPDF(html, pdfOptions) {
  let browser;
  if(process.env.NODE_ENV==="development") {
    browser = await devChromium.launch({headless: true});
  } else {
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })
  }
  if(!browser) return;
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setContent(html);
  const pdf = await page.pdf(pdfOptions);
 
  await browser.close();
  return pdf;
};

const makePDF = async (component, res) => {
  const html = `
    <html>
    <head>
      <style>${normalizeCSS}</style>
    </head>
      <body>
        ${renderToStaticMarkup(component)}
      </body>
    </html>
  `;
  const options = {
    format: "Letter",
    orientation: "potrait",
    type: "pdf",
    timeout: 30000,
  };

  try {
    const pdfBuffer = await printPDF(html, options);
    res.setHeader("Content-Type", "application/pdf");
    res.end(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.end(e.toString());
  }
};

export default makePDF;
