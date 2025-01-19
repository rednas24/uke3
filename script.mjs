import express from 'express';
import HTTP_CODES from './utils/httpCodes.mjs';

const server = express();
const port = (process.env.PORT || 8000);

server.set('port', port);
server.use(express.static('public'));

// Funksjon for root
function getRoot(req, res, next) {
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
}

// Funksjon for å returnere et dikt
function getPoem(req, res, next) {
    const poem = `
        Roses are red,
        Violets are blue,
        Sugar is sweet,
        And so are you.
    `;
    res.status(HTTP_CODES.SUCCESS.OK).send(poem).end();
}

// Funksjon for å returnere et tilfeldig sitat
function getQuote(req, res, next) {
    const quotes = [
        "The only limit to our realization of tomorrow is our doubts of today.",
        "Life is what happens when you're busy making other plans.",
        "In the middle of every difficulty lies opportunity.",
        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "Happiness is not something ready made. It comes from your own actions."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.status(HTTP_CODES.SUCCESS.OK).send(randomQuote).end();
}

// Routes
server.get("/", getRoot);
server.get("/tmp/poem", getPoem);
server.get("/tmp/quote", getQuote);

server.listen(server.get('port'), function () {
    console.log('server running on port', server.get('port'));
});
