import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import HTTP_CODES from './utils/httpCodes.mjs';
import log from './modules/log.mjs';
import session from 'express-session';
import FileStore from 'session-file-store';
import { LOGG_LEVELS, eventLogger } from './modules/log.mjs';

const FileStoreInstance = FileStore(session);
const ENABLE_LOGGING = false;
const server = express();
const port = process.env.PORT || 8000;

const logger = log(LOGG_LEVELS.VERBOSE);
server.set('port', port);
server.use(logger);
server.use(express.static('public'));
server.use(express.json());

server.use(session({
    store: new FileStoreInstance({ path: './sessions', retries: 1 }),
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

server.get('/session', (req, res) => {
    if (!req.session.sessionId) {
        req.session.sessionId = uuidv4();
    }
    res.status(HTTP_CODES.SUCCESS.OK).send({ sessionId: req.session.sessionId });
});

const decks = {};

//creates new deck seed
function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    return suits.flatMap(suit => ranks.map(rank => ({ rank, suit })));
}

//function too create a new deck
function cardSeed (req, res){
    const deckId = uuidv4();
    decks[deckId] = createDeck();
    res.status(HTTP_CODES.SUCCESS.CREATED).send({ deck_id: deckId });
};

// function too shuffle deck seed
function shuffleSeed (req, res){
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).send('Deck not found.');
        return;
    }

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    res.status(HTTP_CODES.SUCCESS.OK).send({ message: 'Deck shuffled.' });
};

// function too show all the cards
function showAllCards (req, res){
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).send('Deck not found.');
        return;
    }

    res.status(HTTP_CODES.SUCCESS.OK).send(deck);
};

// function too show 1 card
function showACard (req, res){
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).send('Deck not found.');
        return;
    }

    if (deck.length === 0) {
        res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).send('No cards left in the deck.');
        return;
    }

    const randomIndex = Math.floor(Math.random() * deck.length);
    const drawnCard = deck.splice(randomIndex, 1)[0];

    res.status(HTTP_CODES.SUCCESS.OK).send(drawnCard);
};

function getRoot(req, res, next) {
    eventLogger("Noen spurte etter root");
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
}


//function too get poem that you want, need
function getPoem(req, res, next) {
    const poem = `
        Roses are red,
        Violets are blue,
        Sugar is sweet,
        And so are you.
    `;
    res.status(HTTP_CODES.SUCCESS.OK).send(poem).end();
}

// function to give on of these quotes
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

//function too add too numbers togheter
function postSum(req, res, next) {
    const a = parseFloat(req.params.a);
    const b = parseFloat(req.params.b);

    if (isNaN(a) || isNaN(b)) {
        res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST)
            .send('Invalid numbers provided.')
            .end();
    } else {
        const sum = a + b;
        res.status(HTTP_CODES.SUCCESS.OK)
            .send({ result: sum })
            .end();
    }
}

// Routes
server.get("/", getRoot);
server.get("/tmp/poem", getPoem);
server.get("/tmp/quote", getQuote);
server.post("/tmp/sum/:a/:b", postSum);
server.get("/tmp/sum/:a/:b", postSum);
server.post("/temp/deck", cardSeed);
server.patch("/temp/deck/shuffle/:deck_id", shuffleSeed);
server.get("/temp/deck/:deck_id", showAllCards);
server.get("/temp/deck/:deck_id/card", showACard);


server.listen(server.get('port'), function () {
    console.log('server running on port', server.get('port'));
});
