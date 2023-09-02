const axios = require("axios");
const puppeteer = require('puppeteer');


const fetchImage = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        if (request.url() === 'https://www.livelox.com/Data/ClassInfo') {
            const postInfo = request.postData();
            const data = JSON.parse(postInfo);
            const headers = request.headers();

            axios.post(
                'https://www.livelox.com/Data/ClassInfo',
                data,
                {
                    headers: headers
                }
            ).then((response) => {
                const data = response.data;
                const blobUrl = data.general.classBlobUrl

                axios.get(blobUrl).then((response) => {
                    const data = response.data;
                    const image = data.map.images[0].url
                    console.log(image);
                    browser.close();
                });

            }, (error) => {
                console.error(error);
                browser.close();
            });
        }

        request.continue();
    });

    await page.goto(url);
}

fetchImage('https://www.livelox.com/Viewer/Porvoo-Jukola-2023-Jukolan-viesti/Jukolan-viesti/6?classId=622294&relayLeg=6&tab=player');
