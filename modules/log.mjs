import { text } from "express";
import fs from "node:fs/promises"

let level_id = 0;


export const LOGG_LEVELS = {
    VERBOSE: ++level_id,
    IMPORTANT: ++level_id,
    ALWAYS: ++level_id,
}

let currentGlobalLogLeve = LOGG_LEVELS.VERBOSE;

let logInstance = async (req, res, next) => {


    await logVerbose(req, res);
    await logImportant(req, res);
    await logAlways(req, res);
    next();
};

const log = function (loggLevel) {
    currentGlobalLogLeve = loggLevel;
    return logInstance;
}

export const eventLogger = function (evetnDescription, loggLevel = LOGG_LEVELS.VERBOSE) {

    if (loggLevel >= currentGlobalLogLeve) {
        console.log(`${Date.now()}|${evetnDescription}`);
        savelog(`${Date.now()}|${evetnDescription}`);
    }


}

const colorize = (text) => {
    const colors = {
        red: `\x1b[1;31m`,
        green: `\x1b[1;32m`,
        yellow: `\x1b[1;33m`,
        reset: `\x1b[0m`
    }
    const methods = {
        GET: colors.green,
        POST: colors.red,
        PUT: colors.red,
        PATCH: colors.yellow
    }

    return `"${methods[text]}${text}${colors.reset}`;

}

const logVerbose = async (req, res, next) => {
    if (LOGG_LEVELS.VERBOSE == currentGlobalLogLeve) {
        await printLog(req, res);
    }
}

const logImportant = async (req, res, next) => {
    if (LOGG_LEVELS.IMPORTANT == currentGlobalLogLeve) {
        await printLog(req, res);
    }
}
const logAlways = async (req, res, next) => {
    if (LOGG_LEVELS.ALWAYS == currentGlobalLogLeve) {
        await printLog(req, res);
    }
}

const printLog = async (req, res) => {
    console.log(`${Date.now()}|${colorize(req.method)}|${req.url}`);
    await savelog(`${Date.now()}|${req.method}|${req.url}`);
}

const savelog = async (text) => {
    text += "\n";
    await fs.appendFile("./logs/log.csv", text);
}

export default log;

