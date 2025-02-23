import express from 'express';
import HTTP_CODES from '../utils/httpCodes.mjs';
import { eventLogger } from '../modules/log.mjs';
import gameCollection from '../gameTree/gameCollection.mjs';

const router = express.Router();

// Routes
router.post('/category/:categoryName', (req, res) => {
    const { categoryName } = req.params;
    gameCollection.addCategory(categoryName);
    res.status(HTTP_CODES.SUCCESS.CREATED).send({ message: `Category '${categoryName}' created.` });
});

router.post('/category/:categoryName/game', (req, res) => {
    const { categoryName } = req.params;
    const { name, description, difficulty } = req.body;
    
    if (!name || !description || !difficulty) {
        return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).send('Missing game details.');
    }
    
    const newGame = new gameCollection.Game(name, description, difficulty);
    gameCollection.addGameToCategory(categoryName, newGame);
    res.status(HTTP_CODES.SUCCESS.CREATED).send({ message: `Game '${name}' added to '${categoryName}'.` });
});

router.get('/category/:categoryName', (req, res) => {
    const { categoryName } = req.params;
    const games = gameCollection.getGamesByCategory(categoryName);
    if (games.length === 0) {
        return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).send('No games found in this category.');
    }
    res.status(HTTP_CODES.SUCCESS.OK).send(games);
});

export default router;
