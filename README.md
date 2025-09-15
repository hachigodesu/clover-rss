# Clover RSS
Node.js RSS feed generator for 4chan

## Feeds
There is one `/board` endpoint which provides an RSS feed for page 1 of a given board (e.g. `/board/g.xml` will return a feed for /g/). Posts that are both closed and sticky will be excluded from the feed.

All data is sourced from the official [4chan API](https://github.com/4chan/4chan-API). The 4chan API rate limits are respected by default, but this can be reconfigured in the `config.json`. Generated feeds are cached in memory for 10 minutes by default, after which new data can be fetched from the 4chan API.

## Running with Docker
Run the following commands to build and run in Docker:

```
git clone https://github.com/hachigodesu/clover-rss.git
cd clover-rss
docker-compose up -d
```