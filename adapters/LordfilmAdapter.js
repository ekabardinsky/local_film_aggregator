const request = require('request-promise');
const cheerio = require('cheerio');
const {get} = require('lodash');

// constants
const domain = 'http://x9.lordfilm6.tv';
const searchUrl = 'http://x9.lordfilm6.tv/index.php';

class LordfilmAdapter {
    constructor() {
        this.name = 'Lordfilm';
    }

    async search(req) {
        const {query} = req.query;
        var options = {
            method: 'POST',
            uri: searchUrl,
            qs: {
                do: 'search'
            },
            formData: {
                do: 'search',
                subaction: 'search',
                search_start: 0,
                result_from: 1,
                story: query
            },
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            followRedirect: true,
            followAllRedirects: true
        };

        const response = await request(options);
        const $ = cheerio.load(response);

        // let's take first 10 results and don't lookup next page to stay faster
        const items = $('.sres-wrap');
        const searchResults = [];

        items.each((i, elem) => {
            const url = `${domain}${elem.attribs.href}`;
            const cover = `${domain}${$(elem).find('img').get(0).attribs.src}`;
            const title = $($(elem).find('h2').get(0)).text();

            searchResults.push({
                title,
                url,
                cover,
                adapter: this.name,
                id: url
            });
        });

        return searchResults;
    }

    async getParts(req) {
        const {url} = req.body;

        // load page
        const response = await request({
            uri: url,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            followRedirect: true,
            followAllRedirects: true
        });

        const $ = cheerio.load(response);

        // extract preloaded players
        const videoBoxes = $('.video-box');

        const iframes = new Set();
        videoBoxes.each((i, elem) => {
            const iframe = $(elem).find("iframe");
            const html = cheerio.html(iframe);

            if (html) {
                iframes.add(html);
            }
        });

        // extract external players
        const kpId = $.html().match(/kp_id =(.*);/)[1].trim();
        try {
            const ellinagraypelUrl = `https://api${Date.now()}.ellinagraypel.com/autochange/info/kinopoisk?id=${kpId}`;
            const ellinagraypelResponse = await request({uri: ellinagraypelUrl, json: true});
            const url = get(ellinagraypelResponse, 'url');

            if (url) {
                iframes.add(`<iframe width="640" height="320" src="${url}" allowfullscreen></iframe>`);
            }
        } catch (e) {
            // do nothing
            console.log(e)
        }



        // check if no players available
        if (!iframes) {
            throw new Error('Player not available');
        }

        return [...iframes].map(item => ({
            url,
            iframe: true,
            iframeHtml: item
        }));
    }

    async getVariants(req) {
        throw new Error('Not supported operation');
    }

    async getSubParts(req) {
        throw new Error('Not supported operation');
    }
}

module.exports = LordfilmAdapter;