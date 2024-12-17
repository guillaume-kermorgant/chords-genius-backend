'use strict'

const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const ChordsModule = require('../../../../src/server/modules/chords');
const server = require('../../../../src/server/app');

describe('routes: chords - GET', () => {

    test('should respond with HTTP status OK and correct payload when searching by track information and when chords module method getChordsBySearch succeeds', async () => {

        const mockChordsModuleResult = {
            key: "D#m",
            chords: ["D#m", "A", "C#m"]
        }
        const mockGetChordsBySearch = jest.spyOn(ChordsModule, 'getChordsBySearch').mockImplementationOnce(() => Promise.resolve(mockChordsModuleResult));
        const artist = 'Fela Kuti';
        const track = 'Water No Get Enemy';
        const response = await request(server).get(`/api/v1/chords?artist=${encodeURI(artist)}&track=${encodeURI(track)}`);

        const expectedBody = {
            ...mockChordsModuleResult,
            searchedArtist: artist,
            searchedTrack: track
        }

        expect(mockGetChordsBySearch).toHaveBeenCalledWith(artist, track, true);
        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual(expectedBody);
    });

    test('should respond with HTTP status Internal Server Error when chords module getChordsBySearch method errors', async () => {

        const errorMessage = 'getChordsBySearch error message';
        jest.spyOn(ChordsModule, 'getChordsBySearch').mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const artist = 'Fela Kuti';
        const track = 'Water No Get Enemy';
        const response = await request(server).get(`/api/v1/chords?artist=${encodeURI(artist)}&track=${encodeURI(track)}`);

        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({ error: errorMessage });
    });

    test('should respond with HTTP status OK and correct payload when searching by key (sharp) and when chords module method getChordsByKey succeeds', async () => {

        const key = 'Dsharpm';
        const parsedKey = 'D#m';
        const mockChordsModuleResult = ["D#m", "A", "C#m"];
        const mockGetChordsByKey = jest.spyOn(ChordsModule, 'getChordsByKey').mockImplementationOnce(() => Promise.resolve(mockChordsModuleResult));
        const response = await request(server).get(`/api/v1/chords?key=${encodeURI(key)}`);

        const expectedBody = {
            chords: mockChordsModuleResult,
            key: parsedKey
        }

        expect(mockGetChordsByKey).toHaveBeenCalledWith(parsedKey);
        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual(expectedBody);
    });

    test('should respond with HTTP status OK and correct payload when searching by key (flat) and when chords module method getChordsByKey succeeds', async () => {

        const key = 'Bflatm';
        const parsedKey = 'B♭m';
        const mockChordsModuleResult = ["B♭m", "D#m", "Fm"];
        const mockGetChordsByKey = jest.spyOn(ChordsModule, 'getChordsByKey').mockImplementationOnce(() => Promise.resolve(mockChordsModuleResult));
        const response = await request(server).get(`/api/v1/chords?key=${encodeURI(key)}`);

        const expectedBody = {
            chords: mockChordsModuleResult,
            key: parsedKey
        }

        expect(mockGetChordsByKey).toHaveBeenCalledWith(parsedKey);
        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual(expectedBody);
    });

    test('should respond with HTTP status Internal Server Error when chords module getChordsByKey method errors', async () => {

        const errorMessage = 'getChordsByKey error message';
        jest.spyOn(ChordsModule, 'getChordsByKey').mockImplementationOnce(() => {
            throw new Error(errorMessage);
        });
        const key = 'E♭m';
        const response = await request(server).get(`/api/v1/chords?key=${encodeURI(key)}`);

        expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.body).toEqual({ error: errorMessage });
    });

    test('should respond with HTTP status Bad Request when no valid parameters are specified', async () => {

        const response = await request(server).get(`/api/v1/chords?invalidparan=coucou`);

        expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        expect(response.body).toEqual({ error: 'Query parameters must be specified: either \"artist\" and \"track\" or \"key\". E.g.: /api/v1/chords?artist=queen&track=bohemian+rhapsody or /api/v1/chords?key=E♭m' });
    });
});