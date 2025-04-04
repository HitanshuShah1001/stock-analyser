import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.google.com/finance/quote/INFY:NSE'); // Replace with your specific URL

  // Wait for the element to appear (optional, but useful for dynamic content)
  await page.waitForSelector('table.slpEwd');

  // Extract the data from the element(s)
  const data = await page.evaluate(() => {
    // Select all divs with both classes
    const elements = Array.from(document.querySelectorAll('table.slpEwd'));
    return elements.map(el => el.textContent.trim());
  });

  console.log(data,"data");
  await browser.close();
})();
