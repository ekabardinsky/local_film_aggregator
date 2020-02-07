const request = require('request-promise');
const domain = 'http://damnserial.ru';
const searchUrl = 'http://damnserial.ru/autocomplete.php';
const coverImage = 'http://datalock.ru/cdn/oblojka';
const cheerio = require('cheerio');
const {get} = require('lodash');
const stripHtml = require("string-strip-html");

class DamnserialAdapter {
    constructor() {
        this.name = 'Damnserial';
    }

    async search(req) {
        const {query} = req.query;

        var options = {
            uri: searchUrl,
            qs: {
                query
            },
            json: true
        };

        const response = await request(options);

        if (response.suggestions[0] === 'ничего не найдено') {
            return [];
        }

        return response.suggestions.valu.map((title, index) => {
            return {
                title,
                url: `${domain}/${response.data[index]}`,
                cover: `${coverImage}/${response.id[index]}.jpg`,
                adapter: this.name,
                id: response.id[index]
            }
        })
    }

    async getParts(req) {
        const {url} = req.body;

        // load page
        const response = await request(url);
        const $ = cheerio.load(response);

        // extract seasons
        const tabElements = $('.tabs-title').children();
        const parts = [];

        tabElements.each((i, elem) => {
            if (get(elem, 'children[0].attribs.href')) {
                parts.push({
                    url: `${domain}/${elem.children[0].attribs.href}`
                });
            }
        });

        // check if no other seasons available
        if (parts.length === 0) {
            return [{url}];
        }

        return parts;
    }

    async getLanguage(req) {
        const {url} = req.body;

        // load page
        const response = await request(url);
        const $ = cheerio.load(response);

        // extract seasons
        const tabElements = $('.tabs-title.translate').children();
        const languages = [];

        tabElements.each((i, elem) => {
            if (elem.attribs['data-playlist']) {
                languages.push({
                    language: elem.children[0].data,
                    url: `${domain}/${elem.attribs['data-playlist']}`
                });
            }
        });

        // check if no other seasons available
        if (languages.length === 0) {
            return [{url}];
        }

        return languages;
    }

    async getSubParts(req) {
        const {url} = req.body;

        // get playlist and decode it
        const playListString = await request(url);
        const playList = JSON.parse(playListString);

        return playList.map(part => {
            const {title, file} = part;
            const encodedLink = file.replace("#2", "").replace("//b2xvbG8=", "");
            const decodedLink = Buffer.from(encodedLink, 'base64');

            return {
                title: stripHtml(title),
                link: decodedLink.toString()
            };
        });
    }
}

module.exports = DamnserialAdapter;