import puppeteer, { Browser, Page } from "puppeteer";
import path from 'path';
import fs from 'fs';

async function discovers_to_json(config) {
    var { browser, page } = await open_google_com(config);

    if (!await is_logined(page)) {
        await browser.close();
        await open_browser_for_login(config);
        let res = await open_google_com(config);
        browser = res.browser;
        page = res.page;
    }

    const discover_items = await get_discover_items(config, page);
    const weather = await get_weather(config, page);
    console.log('discover_items', discover_items, weather);

    browser.close();

    const devPath = path.join(process.cwd(), config.outJson);
    const prodPath = path.join(process.resourcesPath, config.outJson);

    fs.writeFileSync(fs.existsSync(devPath) ? devPath : prodPath, JSON.stringify({
        fetchedAt: new Date().toISOString(),
        items: discover_items,
        weather,
    }, null, 2), 'utf-8');

}

async function open_browser_for_login(config, browser = null) {
    const res = await open_google_com(config, true, true, browser);
    browser = res.browser;
    const page = res.page;

    await page.evaluate(async () => {
        window.alert('ログインができたら閉じてください');
    });

    // 画面が閉じるまで待つ
    await new Promise(resolve => {
        browser.on('disconnected', resolve);
    });
}



/**
 * @param {Object} config 
 * @param {Page} page 
 * @returns {Object[]}
 */
async function get_discover_items(config, page) {
    const items = await page.evaluate(async () => {
        let container = null;

        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (
                !document.querySelector('img[src="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="]')
                && document.querySelector('[data-psd-doc-creation-date]')
            ) break;
        }

        for (let i = 0; i < 10 && !container; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const h2 = [...document.getElementsByTagName('h2')]
                .find(v => v.innerText === "Discover");
            if (!h2) continue;

            const divs = [...h2.parentElement.getElementsByTagName('div')];
            container = divs.find(v => v.innerText.trim() !== '' && v.childElementCount >= 10);
            // console.log(container);
        }

        if (!container) return [];

        const children = [...container.children];

        // 必要に応じて中身を整形
        return children.map(el => {

            /**
            container = [...[...document.getElementsByTagName('h2')].find(v => v.innerText === "Discover").parentElement.getElementsByTagName('div')].find(v => v.innerText.trim() !== '' && v.childElementCount >= 10);
            children = [...container.children];
            el = children[0];
             */

            const [title, discription] = el.innerText.split('\n');
            const datetime = el.querySelector('[data-psd-doc-creation-date]')?.getAttribute('data-psd-doc-creation-date');
            const linkEl = el.querySelector('a[href]');
            const link = linkEl ? linkEl.href : '';
            const imgEl = el.querySelector('img');
            const img = imgEl ? imgEl.src : '';
            const [source_img, source] = [...[...el.getElementsByTagName('div')].findLast(v => v.childElementCount == 3).children].map(v => v.innerText.trim() || v.querySelector('img[src]')?.src);
            return { title, discription, link, img, source, source_img, datetime };
        });
    });

    return items;
}

/**
 * @param {Object} config 
 * @param {Page} page 
 */
async function get_weather(config, page) {
    const item = await page.evaluate(async () => {
        let container = null;
        for (let i = 0; i < 10 && !container; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            container = document.querySelector(`a[href*="${encodeURIComponent('天気')}"]`);
            if (container) break;
        }

        if (!container) return null;

        let [cityname, weather, rainrate, temperature] = [...container.getElementsByTagName('span')].filter(v => v.childElementCount).map(v => v.innerText);
        let [rainicon, weathericon] = [...container.getElementsByTagName('img')].map(v => v.src);

        return { cityname, weather, rainrate, temperature, rainicon, weathericon };
    });

    return item;
}

/**
 * 
 * @param {Object} config 
 * @param {Browser} browser 
 * @returns {Promise<{ browser: Browser, page: Page }>}
 */
async function open_google_com(config, is_no_automation = false, force_new = false, browser = null) {
    let options = {
        // executablePath: config.chromeExecutablePath,
        headless: config.headless && !force_new,
        args: [
            // `--user-data-dir=${config.userDataDir}`,
            // `--profile-directory=${config.profileDirectory}`,
            `--user-data-dir=${config.userDataDir}`,
            '--profile-directory=Default',
            '--no-sandbox',
            // '--disable-gpu',
            '--lang=' + config.lang,
        ],
    };
    if (!force_new) options.defaultViewport = { width: 1280, height: 1280 };
    if (is_no_automation) {
        options.ignoreDefaultArgs = [
            '--enable-automation',
        ];
        options.args.push('--disable-blink-features=AutomationControlled');
    }

    var page = null;

    if (browser) {
        page = await browser.newPage();
    } else {
        browser = await puppeteer.launch(options);
        page = (await browser.pages())[0];
    }
    // console.log(`pages`, pages);

    if (is_no_automation) await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36');
    await page.goto('https://www.google.com/?hl=ja', { waitUntil: 'domcontentloaded' });

    return { browser, page };
}

async function is_logined(page) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 念のため
    let is_logined = await page.evaluate(async () => {
        let header_items = document.querySelector('header').children;
        let button = header_items[header_items.length - 1].querySelector('a[aria-label][href*="https://accounts.google.com/ServiceLogin"]');
        return !Boolean(button);
    });

    return is_logined;
}



function getConfigPath() {
    const devPath = path.join(process.cwd(), "config.json");
    const prodPath = path.join(process.resourcesPath, "config.json");
    return fs.existsSync(devPath) ? devPath : prodPath;
}

function get_config() {
    const file = getConfigPath();
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}



export { discovers_to_json, get_config };