const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // We mock MockData and getTeam
    await page.route('**/*', (route) => {
        route.continue();
    });

    // Mock HTML with required globals
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
            <div id="page_scorekeeper"></div>
            <script>
                const MockData = {
                    schedule: [ { id: 'G-001', homeTeamId: 'LII', awayTeamId: 'TOR' } ],
                    teams: {
                        'LII': { id: 'LII', name: 'Leiden Lions', shortName: 'LII', color: '#e67e22' },
                        'TOR': { id: 'TOR', name: 'Toronto', shortName: 'TOR', color: '#004b8d' }
                    }
                };
                function getTeam(id) {
                    return MockData.teams[id];
                }
            </script>
            <script>
                ${require('fs').readFileSync('Plugin_Scorekeeper.html.txt', 'utf8').replace(/<script>/g, '').replace(/<\/script>/g, '')}
                startScorekeeperConsole('G-001');
            </script>
        </body>
        </html>
    `;

    await page.setContent(html);
    await page.waitForTimeout(1000);
    const errors = [];
    page.on('pageerror', err => {
        errors.push(err.message);
    });

    await page.evaluate(() => {
        // Try starting custom game too
        startScorekeeperConsole('custom', { homeTeamId: 'LII', awayTeamId: 'TOR' });
    });

    console.log("Errors found: ", errors);

    await browser.close();
})();
