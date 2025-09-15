const express = require('express');
const router = express.Router();
const axios = require('axios');
const RSS = require('rss');
const config = require('../config.json');
const { boards } = require('../boards.json');

const validBoards = ["3", "a", "aco", "adv", "an", "b", "bant", "biz", "c", "cgl", "ck", "cm", "co", "d", "diy", "e", "f", "fa", "fit", "g", "gd", "gif", "h", "hc", "his", "hm", "hr", "i", "ic", "int", "jp", "k", "lgbt", "lit", "m", "mlp", "mu", "n", "news", "o", "out", "p", "po", "pol", "pw", "qst", "r", "r9k", "s", "s4s", "sci", "soc", "sp", "t", "tg", "toy", "trash", "trv", "tv",  "u", "v", "vg", "vip", "vm", "vmg", "vp", "vr", "vrpg", "vst", "vt", "w", "wg", "wsg", "wsr", "x", "xs", "y"];

const cache = {};

async function generateFeed(board, queue, cachedTime) {
    try {
        const boardIndexReq = await queue.add(() => axios.get(`http://a.4cdn.org/${board}/1.json`, {
            headers: {
                "If-Modified-Since": cachedTime ? new Date(cachedTime).toUTCString() : new Date(1064966400000).toUTCString() 
            }
        }));

        const boardFeed = new RSS({
            title: `4chan /${board}/`,
            description: boards.find(boardItem => boardItem.board === board).meta_description,
            language: "en-us",
            feed_url: `${config.address}/board/${board}.xml`,
            site_url: `https://boards.4chan.org/${board}/`
        });

        boardIndexReq.data.threads.forEach((thread) => {
            let op = thread.posts[0];

            if(op.sticky && op.closed) return;

            boardFeed.item({
                title: op.sub ?? `Untitled Post (${op.no})`,
                description: op.com ?? `No comment provided`,
                url: `https://boards.4chan.org/${board}/thread/${op.no}`,
                author: `${op.name ? op.name : ""}${op.trip ? ` ${op.trip}` : ""}${op.capcode ? ` ${op.capcode}` : ""}${op.id ? ` (ID:${op.id})` : ""}${op.country ? ` [${op.country} - ${op.country_name}]` : ""}${op.board_flag ? ` [${op.board_flag} - ${op.flag_name}]` : ""}`,
                date: new Date(op.time * 1000).toUTCString(),
                enclosure: {
                    url: `https://i.4cdn.org/${board}/${op.tim}${op.ext}`
                }
            });
        });

        return boardFeed.xml({indent: true});

    } catch (error) {
        if (error.response.status === 304) return cache[board].xml;

        console.error(`Error generating feed for /${board}/:`, error);
    }
};

async function getFeed(board, req) {
    const currentTime = Date.now();
    const timestamp = cache[board] ? cache[board].timestamp : undefined;

    if(cache[board] && (currentTime - timestamp < config.maxCacheAge)) return cache[board].xml;

    const updatedFeed = await generateFeed(board, req.fourchanAPIqueue, timestamp);
    cache[board] = { xml: updatedFeed, timestamp: currentTime };
    return updatedFeed;
}

router.get('/:board.xml', async (req, res) => {
    const { board } = req.params;

    if (!validBoards.includes(board.toLowerCase())) return res.status(404).json({ error: 'Invalid board' });

    const rssFeed = await getFeed(board.toLowerCase(), req);
    res.set('Content-Type', 'application/rss+xml');
    res.status(200).send(rssFeed);
});

module.exports = router;