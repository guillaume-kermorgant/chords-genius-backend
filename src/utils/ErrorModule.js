'use strict'

const { StatusCodes } = require('http-status-codes');

// TODO: need global error handler, then this module can be used to throw errors whenever we need to.

class APIError extends Error {

    /*
     * Create a new API Error
     * 
     * @param {string} name - name of the error
     * @param {number} status - HTTP status code
     * @param {string} message - an error message
     * 
    */
    constructor(name, status, message, errors = undefined) {
        super(message);
        this.name = name;
        this.status = status;
        this.errors = errors;
    }
}

const ERROR = {
    FIND_CHORDS_ERROR: 'FindChordsError'
}

const ErrorModule = {

    FindChordsError(message) {
        return new APIError(
            ERROR.FIND_CHORDS_ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message
        );
    }
}

ErrorModule.ERROR = ERROR;

module.exports = ErrorModule;