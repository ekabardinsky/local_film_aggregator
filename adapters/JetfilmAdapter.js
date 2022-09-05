const request = require('request-promise');
const cheerio = require('cheerio');
const {get} = require('lodash');

// constants
const domain = 'https://jfe5.jetfilm.club';
const searchUrl = `${domain}/search`;

class JetfilmAdapter {
    constructor() {
        this.name = 'Jetfilm';
    }

    async search(req) {
        const {query} = req.query;
        var options = {
            method: 'GET',
            uri: searchUrl,
            qs: {
                filter: 1,
                query,
                sortby: 'rating'
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
        const items = $('.film-item');
        const searchResults = [];

        items.each((i, elem) => {
            const url = `${domain}${elem.attribs.href}`;
            const cover = $(elem).find('img').get(0).attribs['data-src'];
            const title = $($(elem).find('.film-item-title').get(0)).text();

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
        const videoBoxes = $('.tab-content iframe');

        const iframes = new Set();
        videoBoxes.each((i, elem) => {
            const scr = elem.attribs.src

            if (scr) {
                iframes.add(`<iframe width="640" height="320" src="${scr}" allowfullscreen></iframe>`);
            }
        });

        // extract external players
        const kpId = $.html().match(/kp_id:\s*'(\d*)'/)[1].trim();
        try {
            const getPlayersUrl = `${domain}/ajax.php`;
            const getPlayersUrlResponse = await request({
                method: 'POST',
                uri: getPlayersUrl,
                formData: {
                    action: 'getPlayers',
                    kp_id: kpId,
                    imdb_id: ''
                }
            });
            const url = get(getPlayersUrlResponse, 'url');

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

module.exports = JetfilmAdapter;
