import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import HTTP_CODES from '../utils/httpCodes.mjs';
import { eventLogger } from '../modules/log.mjs';

const router = express.Router();
const decks = {};

function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    return suits.flatMap(suit => ranks.map(rank => ({ rank, suit })));
}

router.get('/', (req, res) => {
    eventLogger("Noen spurte etter root");
    res.status(HTTP_CODES.SUCCESS.OK).send('Hello World').end();
});

router.get('/tmp/poem', (req, res) => {
    const poem = `
        Roses are red,
        Violets are blue,
        Sugar is sweet,
        And so are you.
    `;
    res.status(HTTP_CODES.SUCCESS.OK).send(poem).end();
});

router.get('/tmp/quote', (req, res) => {
    const quotes = [
        "The only limit to our realization of tomorrow is our doubts of today.",
        "Life is what happens when you're busy making other plans.",
        "In the middle of every difficulty lies opportunity.",
        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "Happiness is not something ready made. It comes from your own actions."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.status(HTTP_CODES.SUCCESS.OK).send(randomQuote).end();
});

router.post('/tmp/sum/:a/:b', postSum);
router.get('/tmp/sum/:a/:b', postSum);
function postSum(req, res) {
    const a = parseFloat(req.params.a);
    const b = parseFloat(req.params.b);
    if (isNaN(a) || isNaN(b)) {
        res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).send('Invalid numbers provided.').end();
    } else {
        res.status(HTTP_CODES.SUCCESS.OK).send({ result: a + b }).end();
    }
}

router.post('/temp/deck', (req, res) => {
    const deckId = uuidv4();
    decks[deckId] = createDeck();
    res.status(HTTP_CODES.SUCCESS.CREATED).send({ deck_id: deckId });
});

router.patch('/temp/deck/shuffle/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];
    if (!deck) {
        res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).send('Deck not found.');
        return;
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    res.status(HTTP_CODES.SUCCESS.OK).send({ message: 'Deck shuffled.' });
});

router.get('/temp/deck/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];
    if (!deck) {
        res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).send('Deck not found.');
        return;
    }
    res.status(HTTP_CODES.SUCCESS.OK).send(deck);
});

router.get('/temp/deck/:deck_id/card', (req, res) => {
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
    const drawnCard = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    res.status(HTTP_CODES.SUCCESS.OK).send(drawnCard);
});

export default router;
