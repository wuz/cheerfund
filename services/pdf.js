import pdf from "html-pdf";
import { renderToStaticMarkup } from "react-dom/server";

import normalizeCSS from "./normalized";

const makePDF = (component, res) => {
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
  pdf.create(html, options).toBuffer((err, buffer) => {
    if (err) {
      console.log(err);
      res.end(err);
    }
    res.setHeader("Content-Type", "application/pdf");
    res.end(buffer);
  });
};

export default makePDF;
