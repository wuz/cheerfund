import { renderToStaticMarkup } from "react-dom/server";
import puppeteer from "puppeteer";

import normalizeCSS from "./normalized";
 
async function printPDF(html, options) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf(options);
 
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
