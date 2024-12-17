'use strict'

const { StatusCodes } = require('http-status-codes');
const ChordsModule = require('../../modules/chords');

module.exports = {

    get: async (req, res) => {
        console.info('GET chords');

        const artist = req.query.artist;
        const track = req.query.track;
        const key = req.query.key;
        if (!!artist && !!track) {
            try {
                // always disabling Elasticsearch search for now
                const results = await ChordsModule.getChordsBySearch(artist, track, false);
                results.searchedArtist = artist;
                results.searchedTrack = track;
                res.status(StatusCodes.OK).json(results);
            } catch (err) {
                console.error(`Error getting chords for search: artist: ${artist}, track: ${track} - ${err}`);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    error: err.message
                });
            }
        }
        else if (!!key) {
            try {
                const parsedKey = key.replace('sharp', '#').replace('flat', '♭');
                const chords = await ChordsModule.getChordsByKey(parsedKey);
                const results = {
                    chords,
                    key: parsedKey
                }
                res.status(StatusCodes.OK).json(results);
            } catch (err) {
                console.error(`Error getting chords for key: ${key} - ${err}`);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    error: err.message
                });
            }
        } else {
            console.error(`Error bad query parameters specified`);
            res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Query parameters must be specified: either "artist" and "track" or "key". E.g.: /api/v1/chords?artist=queen&track=bohemian+rhapsody or /api/v1/chords?key=E♭m'
            });
        }

        console.info('exit GET');
    }
}