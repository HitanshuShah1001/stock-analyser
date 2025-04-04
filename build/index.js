import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import puppeteer from "puppeteer";
import { z } from "zod";
const getStockData = async ({ url }) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url); // Replace with your specific URL
    // Wait for the element to appear (optional, but useful for dynamic content)
    await page.waitForSelector("div.YMlKec.fxKbKc");
    // Extract the data from the element(s)
    const data = await page.evaluate(() => {
        // Select all divs with both classes
        const elements = Array.from(document.querySelectorAll("div.YMlKec.fxKbKc"));
        return elements.map((el) => el.textContent?.trim());
    });
    return data;
};
const getIncomeStatementsAndFinancials = async ({ url }) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url); // Replace with your specific URL
    // Wait for the element to appear (optional, but useful for dynamic content)
    await page.waitForSelector("table.slpEwd");
    // Extract the data from the element(s)
    const data = await page.evaluate(() => {
        // Select all divs with both classes
        const elements = Array.from(document.querySelectorAll("table.slpEwd"));
        return elements.map((el) => el.textContent?.trim());
    });
    return data;
};
const server = new McpServer({
    name: "stock-analyser",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
async function getStockPriceRequest(url) {
    try {
        const response = getStockData({ url });
        if (!response) {
            throw new Error("Error finding stock price!");
        }
        else {
            return response;
        }
    }
    catch (e) {
        throw new Error("Unexpected error occured!", e);
    }
}
async function getFundamentalsRequest(url) {
    try {
        const response = getIncomeStatementsAndFinancials({ url });
        if (!response) {
            throw new Error("Error finding stock price!");
        }
        else {
            return response;
        }
    }
    catch (e) {
        throw new Error("Unexpected error occured!", e);
    }
}
server.tool("get-stock-data", "Get live stock price for a stock", {
    ticker: z
        .string()
        .describe("Ticker symbol for a stock - for example for Infosys it will be INFY:NSE"),
}, async ({ ticker }) => {
    const url = `https://www.google.com/finance/quote/${ticker}`;
    const response = await getStockPriceRequest(url);
    if (!response) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve alerts data",
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
                text: response[0] ?? 'No stock data found',
            },
        ],
    };
});
server.tool("get-income-statement-and-fundamental-data", "Get live income statements and fundamentals for a stock", {
    ticker: z
        .string()
        .describe("Ticker symbol for a stock - for example for Infosys it will be INFY:NSE"),
}, async ({ ticker }) => {
    const url = `https://www.google.com/finance/quote/${ticker}`;
    const response = await getFundamentalsRequest(url);
    if (!response) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to retrieve alerts data",
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
                text: response[0] ?? 'No stock data found',
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Stock Analyser running on STDIO");
}
main().catch((error) => {
    console.log(`Error occured`, error);
    process.exit(1);
});
