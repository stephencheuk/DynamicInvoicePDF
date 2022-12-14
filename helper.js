
const fs = require('fs');

const helper = () => {

  const getFile = (path) => {
    if (fs.existsSync(path)) {
      return fs.readFileSync(path, 'utf8');
    }else{
      throw new Error(`file (${path}) does not exists `);
    }
  }

  const genPDF = async (htmlURL, pdfOptions = { width: 595, height: 842, size: "small" }, req, res) => {
    let chrome = {};
    let puppeteer;

    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      chrome = require("chrome-aws-lambda");
      puppeteer = require("puppeteer-core");
    } else {
      puppeteer = require("puppeteer");
    }

    let options = {};

    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      options = {
        args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      };
    }else{
      options = {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
        headless: true,
        defaultViewport: null,
      }
    }

    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();

    let response;

    if(htmlURL && htmlURL.file){
      response = await page.setContent(htmlURL.html);
      //, {
      //  waitUntil: 'domcontentloaded'
      //});
    }else if(htmlURL && htmlURL.html){
      response = await page.setContent(htmlURL.html);
      //, {
      //  waitUntil: 'domcontentloaded'
      //});
    }else if(htmlURL && htmlURL.url){
      response = await page.goto(htmlURL.url);
      //, {
      //  waitUntil: 'networkidle2'
      //});
    }

    const size = pdfOptions.size;
    const maxWidth = 1078;
    const minWidth = 715;

    let width = minWidth;
    if(size === "small"){
      width = minWidth;
    }else if(size === "regular"){
      width = (maxWidth + minWidth)/2;
    }else if(size === "larger"){
      width = maxWidth;
    }

    await page.evaluate(`
      var div = document.createElement("div");
      div.style.position = 'absolute';
      div.style.top = '0';
      div.style.left = '0';
      div.style.width = '${width}px';
      div.style.height = '1px';
      div.style.border = '1px solid transparent';
      document.body.append(div);
    `);

    // If the page doesn't return a successful response code, we fail the check
    if(htmlURL && htmlURL.url && response.status() > 399) {
      console.log(`Failed with response code ${response.status()}`);
      throw new Error(`Failed with response code ${response.status()}`)
    }

    let pdf = await page.pdf({
      format: 'A4',
      margin: { left: '1cm', top: '1cm', right: '1cm', bottom: '1.5cm' },
      printBackground: true,
      //width: 1024,
      //height: 1448,
      //scale: 1,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 90%;
                    height: 0;
                    margin: auto;
                    font-size: 12px;
                    padding: 1px 0 0 0;
                    position: relative;
                    border: 1px solid black;
                    ">
          <div style="position: absolute; width:100%; top: 40px; text-align: right">
            <span class="pageNumber"></span>/<span class="totalPages"></span>
          </div>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; font-size: 9px;
            padding: 5px 5px 0; color: #bbb; position: relative;">
            <div style="position: absolute; width:100%; top: -20px;">
              <div style="text-align: center">
                Date: <span class="date"></span>
                &nbsp;-&nbsp;
                Page: <span class="pageNumber"></span>/<span class="totalPages"></span>
              </div>
            </div>
        </div>
      `,
    });

    await page.close()
    await browser.close();

    res.setHeader('Content-type', 'application/pdf');
    res.setHeader('isBase64Encoded', true);
    // pdf = pdf.toString('base64');
    res.status(200).send(pdf);
  }

  return {
    getFile,
    genPDF,
  }
}

module.exports = helper;
