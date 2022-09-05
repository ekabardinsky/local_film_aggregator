const request = require('request-promise');
const cheerio = require('cheerio');
const {get} = require('lodash');

// constants
const searchUrl = `https://www.kinopoisk.ru/s/type/film/list/1/find/`;

class YohohoAdapter {
    constructor() {
        this.name = 'Yohoho';
    }

    async search(req) {
        const {query} = req.query;
        var options = {
            method: 'GET',
            uri: `${searchUrl}${encodeURIComponent(query)}/order/relevant/perpage/10/`,
            qs: {
                kp_query: query,
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
        const items = $('.element');
        const searchResults = [];

        items.each((i, elem) => {
            const nameElem = $(elem).find('.name').get(0);
            const url = `https://www.kinopoisk.ru${$(nameElem).find('a').get(0).attribs.href}`;
            const title = $(nameElem).text();
            const kpIdElem = $(elem).find('.pic a');
            const kpId = kpIdElem.length > 0 ? kpIdElem.get(0).attribs['data-id'] : null;

            searchResults.push({
                title,
                url: kpId != null ? `/yohoho.html?kpId=${kpId}` : null,
                cover: kpId != null ? `https://www.kinopoisk.ru/images/sm_film/${kpId}.jpg` : null,
                adapter: this.name,
                isYohoho: true,
                id: url
            });
        });

        return searchResults.filter(item => item.url != null);
    }

    async getParts(req) {
        throw new Error('Not supported operation');
    }

    async getVariants(req) {
        throw new Error('Not supported operation');
    }

    async getSubParts(req) {
        throw new Error('Not supported operation');
    }
}

module.exports = YohohoAdapter;
