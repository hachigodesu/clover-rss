const express = require('express');
const PQueue = require('p-queue').default;
const boardsRouter = require('./routes/boards');
const config = require('./config.json');

const app = express();
const fourchanAPIqueue = new PQueue({
    concurrency: 1,
    interval: config.fourchanAPIrateLimit,
    intervalCap: 1
});

app.use(express.json());
app.use('/board', (req, res, next) => {
    req.fourchanAPIqueue = fourchanAPIqueue;
    next();
}, boardsRouter);

app.listen(config.port, () => {
    console.log(`Clover RSS is running on http://localhost:${config.port}\nThe configuration can be modified in the config.json file`);
});