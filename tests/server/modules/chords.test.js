'use strict'

const ChordsModule = require('../../../src/server/modules/chords');
const ElasticSearchModule = require('../../../src/server/modules/elasticsearch');

describe('modules: chords', () => {

    test('getKeyDetails returns right details',  () => {

        let key = 'B♭ Minor';
        let results = ChordsModule.getKeyDetails(key);
        expect(results).toEqual({
            root: 'B♭',
            isMinor: true,
            isSharp: false,
            isFlat: true
        });

        key = 'c#';
        results = ChordsModule.getKeyDetails(key);
        expect(results).toEqual({
            root: 'C#',
            isMinor: false,
            isSharp: true,
            isFlat: false
        });

        key = 'E';
        results = ChordsModule.getKeyDetails(key);
        expect(results).toEqual({
            root: 'E',
            isMinor: false,
            isSharp: false,
            isFlat: false
        });
    });

    test('getKeyDetails should error when key is not parsable', (done) => {

        const invalidKeyValues = [undefined, '', 'K', 123];
        invalidKeyValues.forEach((invalidKey) => {
            try {
                ChordsModule.getKeyDetails(invalidKey);
                done('Error: getKeyDetails should throw an error when passed key is not valid');
            } catch (err) {
                expect(err.message).toInclude(`Key ${invalidKey} could not be parsed:`);
            }
        });

        done();
    });

    test('getChordsByKey returns right chords',  () => {

        let key = 'C'
        let results = ChordsModule.getChordsByKey(key);
        expect(results).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);

        key = 'C Minor'
        results = ChordsModule.getChordsByKey(key);
        expect(results).toEqual(['Cm', 'Ddim', 'D#', 'Fm', 'Gm', 'G#', 'A#']);

        // key = 'B♭ Minor';
        // results = ChordsModule.getScaleByKey(key);
    });

    test('getPlayableChords returns right chords',  () => {

        const chords = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'];
        expect(ChordsModule.getPlayableChords(chords, ChordsModule.COMBINATION_CODES.DEFAULT)).toEqual([ 'C', 'F', 'G' ]);
    });

    test('getChordsBySearch - returns ElasticSearch results when found', async () => {

        const artist = 'Fela Kuti';
        const track = 'Water No Get Enemy';
        const chordsSequence = ['B♭', 'C#', 'F'];
        const esResults = {
            artist,
            track,
            chordsSequence
        }
        const mockElasticSearchModuleSearch = jest.spyOn(ElasticSearchModule, 'searchTrack').mockImplementationOnce(() =>  Promise.resolve(esResults));

        const results = await ChordsModule.getChordsBySearch(artist, track, true);

        expect(mockElasticSearchModuleSearch).toHaveBeenCalledWith(artist, track);
        expect(results).toEqual(esResults);
    });
});