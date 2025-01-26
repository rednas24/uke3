import { setUncaughtExceptionCaptureCallback } from "node:process"

const HTTP_CODES = {

    SUCCESS: {
        OK: 200,
        CREATED: 201,
    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
    },
}

export default HTTP_CODES;