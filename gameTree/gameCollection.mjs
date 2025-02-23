import { v4 as uuidv4 } from 'uuid';

class Game {
    constructor(name, description, difficulty) {
        this.id = uuidv4();
        this.name = name;
        this.description = description;
        this.difficulty = difficulty;
    }
}

class GameCategory {
    constructor(categoryName) {
        this.categoryName = categoryName;
        this.games = [];
    }

    addGame(game) {
        this.games.push(game);
    }
}

class GameCollection {
    constructor() {
        this.categories = new Map();
    }

    addCategory(categoryName) {
        if (!this.categories.has(categoryName)) {
            this.categories.set(categoryName, new GameCategory(categoryName));
        }
    }

    addGameToCategory(categoryName, game) {
        if (!this.categories.has(categoryName)) {
            this.addCategory(categoryName);
        }
        this.categories.get(categoryName).addGame(game);
    }

    getGamesByCategory(categoryName) {
        return this.categories.get(categoryName)?.games || [];
    }
}

const gameCollection = new GameCollection();
export default { gameCollection, Game };
