const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'file://' + path.resolve(__dirname, 'index.html');

    const sections = ['hero', 'about', 'work', 'sketches', 'fullmoon', 'matrix', 'zara', 'jungle', 'experience-section', 'contact'];

    // ── DESKTOP (1440x900) ──────────────────
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });

    // Wait for loader
    await page.waitForFunction(() => {
        const loader = document.getElementById('loader');
        return loader && (loader.style.display === 'none');
    }, { timeout: 12000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    // Scroll through entire page to trigger all GSAP ScrollTrigger animations
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < totalHeight; y += 400) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
        await new Promise(r => setTimeout(r, 100));
    }
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    // Screenshot each section
    for (const id of sections) {
        try {
            // Scroll to element first
            await page.evaluate((sel) => {
                const el = document.getElementById(sel);
                if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }, id);
            await new Promise(r => setTimeout(r, 300));

            const el = await page.$('#' + id);
            if (el) {
                await el.screenshot({ path: `screenshots/desktop-${id}.png` });
                console.log(`  desktop-${id}.png`);
            }
        } catch (e) {
            console.log(`  Skip ${id}: ${e.message}`);
        }
    }

    // ── MOBILE (390x844) ────────────────────
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });

    await page.waitForFunction(() => {
        const loader = document.getElementById('loader');
        return loader && (loader.style.display === 'none');
    }, { timeout: 12000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    // Scroll through entire page
    const totalHeightMob = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < totalHeightMob; y += 300) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
        await new Promise(r => setTimeout(r, 80));
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    for (const id of sections) {
        try {
            await page.evaluate((sel) => {
                const el = document.getElementById(sel);
                if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }, id);
            await new Promise(r => setTimeout(r, 300));

            const el = await page.$('#' + id);
            if (el) {
                await el.screenshot({ path: `screenshots/mobile-${id}.png` });
                console.log(`  mobile-${id}.png`);
            }
        } catch (e) {
            console.log(`  Skip ${id}: ${e.message}`);
        }
    }

    await browser.close();
    console.log('\nDone!');
})();
