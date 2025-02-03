import express from 'express'
import HTTP_CODES from './utils/httpCodes.mjs';
import log from './modules/log.mjs';
import { LOGG_LEVELS, eventLogger } from './modules/log.mjs';

const ENABLE_LOGGING = false;

const server = express();
const port = (process.env.PORT || 8000);

const logger = log(LOGG_LEVELS.VERBOSE);

server.set('port', port);
server.use(logger);
server.use(express.static('public'));

function getRoot(req, res, next) {
    eventLogger("Noen spurte etter root");
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
}

server.get("/", getRoot);


server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});