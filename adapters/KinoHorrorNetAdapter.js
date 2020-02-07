const request = require('request-promise');
const cheerio = require('cheerio');
const {get} = require('lodash');
const stripHtml = require("string-strip-html");

// constants
const domain = 'https://kino-horror.net';
const searchUrl = 'https://kino-horror.net/search/';

class KinoHorrorNetAdapter {
    constructor() {
        this.name = 'KinoHorrorNet';
    }

    async search(req) {
        const {query} = req.query;

        var options = {
            uri: searchUrl,
            qs: {
                q: query,
                t: 0,
                p: 1
            },
            json: true
        };

        const response = await request(options);
        const $ = cheerio.load(response);

        // let's take first 10 results and don't lookup next page to stay faster
        const items = $('.eBlock');
        const searchResults = [];

        items.each((i, elem) => {
            if (get(elem, 'children[0].children[0].children[0]')) {
                const parentNode = $(elem).find('td');
                const titleElement = $(parentNode).find('.eTitle a').get(0);
                const url = titleElement.attribs.href;
                const title = $(titleElement).text();
                const coverRef = $(parentNode).find('.ulightbox').get(0).attribs.href;
                const cover = `${domain}${coverRef}`;

                searchResults.push({
                    title,
                    url,
                    cover,
                    adapter: this.name,
                    id: url
                });
            }
        });

        return searchResults;
    }

    async getParts(req) {
        const {url} = req.body;

        // load page
        const response = await request(url);
        const $ = cheerio.load(response);

        // extract seasons
        const iframe = $('#content1').html();

        // check if no players available
        if (!iframe) {
            throw new Error('Player not available');
        }

        return [{
            url,
            iframe: true,
            iframeHtml: iframe
        }];
    }

    async getVariants(req) {
        throw new Error('Not supported operation');
    }

    async getSubParts(req) {
        throw new Error('Not supported operation');
    }
}

module.exports = KinoHorrorNetAdapter;