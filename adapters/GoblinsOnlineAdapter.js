const request = require('request-promise');
const cheerio = require('cheerio');
const {get} = require('lodash');

// constants
const domain = 'http://goblins-online.ru';
const searchUrl = 'http://goblins-online.ru/component/search/';

class GoblinsOnlineAdapter {
    constructor() {
        this.name = 'GoblinsOnline';
    }

    async search(req) {
        const {query} = req.query;

        var options = {
            uri: searchUrl,
            qs: {
                searchword: query,
                searchphrase: 'all'
            }
        };

        const response = await request(options);
        const $ = cheerio.load(response);

        // let's take first 10 results and don't lookup next page to stay faster
        const items = $('.featured-blog-item');
        const searchResults = [];

        items.each((i, elem) => {
            // check cover. In case if no cover presented - this is not a movie item
            const imgElement = $(elem).find('.item-image img').get(0);
            if (imgElement) {
                const title = $(elem).find('.result-title').text().trim();
                const path = $(elem).find('.result-title a').get(0).attribs.href;
                const imgPath = imgElement.attribs.src;

                const url = `${domain}${path}`;
                const cover = `${domain}${imgPath}`;

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
        const iframe = $('.page-header iframe').get(0);

        // check if no players available
        if (!iframe) {
            throw new Error('Player not available');
        }

        return [{
            url,
            iframe: true,
            iframeHtml: $(iframe).parent().html()
        }];
    }

    async getVariants(req) {
        throw new Error('Not supported operation');
    }

    async getSubParts(req) {
        throw new Error('Not supported operation');
    }
}

module.exports = GoblinsOnlineAdapter;