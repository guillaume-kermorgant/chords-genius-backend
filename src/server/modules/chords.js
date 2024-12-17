'use strict'

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Disabling Elasticsearch for now
// const ElasticSearchModule = require('./elasticsearch');
const NotesModule = require('./notes');
const Combinations = require('./Combinations.json');

const COMBINATION_CODES = {
    DEFAULT: 'I-IV-V'
}

/*
    * Get track info, based on input search
    * 
    * @param {string} search - information about the track, usually input by the user (e.g. "Fela Kuti Water No Get Enemy")
    * @returns {object} - an object containing information about the track:
    * key, camelot value, bpm, artist name, track name
    * any of those values may be undefined if they are not found
    * 
    * @description search track information on tunebat
    * 
*/
const getTrackInfo = async (search) => {

    // it used to work with tunebat two years ago but now it seems they changed their security policy. Passing referrer and user agent is not enough, apparently.
    // const url = `https://tunebat.com/Search?q=${encodeURI(search)}`;
    // for now we are using google... but this is very fragile.
    const googleSearch = `tunebat ${search}`;
    const url = `https://www.google.com/search?client=firefox-b-d&q=${encodeURI(googleSearch)}`;
    console.info(`Scrapping key for search: ${search}`);
    console.info(`URL to scrap: ${url}`);

    const resourceLoader = new jsdom.ResourceLoader({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0"
      });

    const dom = await JSDOM.fromURL(url, {
        resources: resourceLoader,
        referrer: "https://google.com/"
    });
    const document = dom.window.document;

    let key = undefined;
    let camelot = undefined;
    let bpm = undefined;
    let artist = undefined;
    let track = undefined;
    const errors = [];

    // following commented part used to work when scraping tunebat.com
    // array with key, camelot value and bpm
    // const songValues = document.getElementsByClassName("search-attribute-value");
    // if (!songValues || songValues.length === 0) {
    //     errors.push('Could not find information about that track. Please, try another search (be aware of typos).');
    //     return { errors };
    // } else {
    //     key = songValues[0].textContent;
    //     camelot = songValues.length > 1 && songValues[1].textContent;
    //     bpm = songValues.length > 2 && songValues[2].textContent;
    //     if (!key || !camelot || !bpm) {
    //         errors.push('Could not find every values (missing key, camelot value or bpm)');
    //     }
    // }
    // try {
    //     artist = document.getElementsByClassName("search-artist-name")[0].textContent;
    // } catch (err) {
    //     errors.push('Could not find artist name');
    // }
    // try {
    //     track = document.getElementsByClassName("search-track-name")[0].textContent;
    // } catch (err) {
    //     errors.push('Could not find track name');
    // }

    // quick and VERY dirty workaround using google search
    const maxIteration = 20
    for (let i =0; i < maxIteration; i++) {
        try {
            // array that's supposed to be [<artist>, <track name>, <key>, <camelot>, <bpm>, <duration>]
            let songValues = document.getElementsByClassName('g')[0].getElementsByTagName('span')[i].textContent.replace(/-/g, ",").split(',');
            artist = songValues[0];
            track = songValues[1];
            key = songValues[2].replace('. key', '').trim();
            camelot = songValues[3].replace('. camelot ', '').trim();
            bpm = songValues[4].replace('. BPM ', '').trim();

            if (!!key && key !== "") {
                console.log(`Found key after scraping google.com: ${key}`);
                break;
            }
        } catch (err) {
            console.log(`Error - scraping google.com: ${err}`);
            if (i == maxIteration - 1) {
                errors.push(`Quick and dirty workaround did not work (scraping google.com instead of tunebat.com)...`);
            }
        }
    }

    const results = {
        key, camelot, bpm, artist, track
    }
    if (errors.length > 0) {
        results.errors = errors;
    }
    return results;
}

/*
* Parse a key - could be in a different module "./modules/Keys.json".. let's see if we have more methods specific to keys processing
* 
* @param {string} key - the key
* @returns {object} - an object containing information about the key: root note, whether it's minor, sharp or flat
* 
*/
const getKeyDetails = (key) => {

    try {
        const isMinor = key.toUpperCase().includes('MINOR');
        // a little bit of redundancy here (c.f. ./modules/Notes.js - isSharp and isFlat methods), but imho it's ok to distinguish keys and notes and I'm too lazy to change that now
        const isSharp = key.includes('#');
        const isFlat = key.includes('♭');
        const root = `${key[0].toUpperCase()}${isSharp ? '#' : (isFlat ? '♭' : '')}`;

        if (!NotesModule.noteIsValid(root)) {
            throw new Error(`parsed root note: ${root} is not a valid note`)
        }

        console.info(`key ${key} has the following features: root note: ${root}${isSharp ? ' (sharp)' : ''}${isFlat ? ' (flat)' : ''}, ${isMinor ? 'minor' : 'major'} `);
        
        return {
            root,
            isMinor,
            isSharp,
            isFlat
        }
    }
    catch (err) {
        throw new Error(`Key ${key} could not be parsed: ${err}`);
    }
}

/*
* Get chords corresponding to a key
* 
* @param {string} key - the key
* @returns {object} - an array containing the chords (ordered from I to VII)
* 
*/
const getChordsByKey = (key) => {
    console.info(`getChordsByKey - ${key}`);
    const keyDetails = getKeyDetails(key);

    // getting intervals between the notes of the scale, based on minor/major mode
    // provided intervals are a number of half tones
    const intervals = keyDetails.isMinor ?
        [2, 1, 2, 2, 1, 2] // natural minor scale (for now, we are only computing this specific minor scale)
        : [2, 2, 1, 2, 2, 2] // major scale
    const root = keyDetails.root;
    const chords = [ `${root}${keyDetails.isMinor ? 'm' : ''}` ];
    for (let i = 0; i < intervals.length; i++) {

        const previousNote = chords[i].replace('dim', '').replace('m', '');
        let nextChord = `${NotesModule.getNoteWithInterval(previousNote, intervals[i])}`;

        // minor chords for:
        // - major scale: II, III and VI degrees
        // - minor scale: I, IV and V degrees
        // !! i = processed degree - 2:
        // [II, III, VI] -> [0, 1, 4] 
        // [IV, V] -> [2, 3] (I i.e. root degree is processed before entering the loop)
        if ((!keyDetails.isMinor && [0, 1, 4].includes(i))
            || (keyDetails.isMinor && [2, 3].includes(i))) {
                nextChord = `${nextChord}m`
        }
        
        // dim chords for:
        // major scale: VII degree (i === 5)
        // minor scale: II degree (i === 0)
        if (!keyDetails.isMinor && i === 5
           || keyDetails.isMinor && i === 0) {
            nextChord = `${nextChord}dim`
        }

        console.log('PUSH CHORD: ' + nextChord);
        chords.push(nextChord);
    }

    return chords;
}

/*
* Get chords corresponding to the combination
* 
* @param {object} chords - all chords
* @param {string} combinationCode - combination (e.g. I-IV-V)
* @returns {object} - an array containing the chords corresponding to the combination
* 
*/
const getPlayableChords = (chords, combinationCode) => {

    const combination = Combinations[combinationCode];
    const playableChords = combination.map((degree) => {
        return chords[degree - 1];
    })
    console.info(`getPlayableChords - chords ${JSON.stringify(chords)}, combination: ${combinationCode}, playable chords: ${playableChords}`);
    return playableChords
}

const ChordsModule = {

    // the following methods could be externalised; leaving them here to make it easier to be tested (otherwise, we would need to use something like the rewire npm module, but this is merely a personal project...)
    getKeyDetails,
    getChordsByKey,
    getPlayableChords,

    /*
    * Get chords, and complementary information (key, camelot value, bpm, compatible key, compatible chords) about the input song
    * 
    * @param {string} artist - artist name
    * @param {string} track - track name
    * @param {boolean} checkES - if set to true, will first call ElasticSearch
    * @returns {object} - an object containing the key, the camelot value the BPM of the song, they might be undefined if some of the values were not found, then an error message is also added to the return value.
    * @description search the song on tunebat and returns its key, camelot value and BPM if found
    * 
    */
    getChordsBySearch: async (artist, track, checkES) => {
        console.info(`CHORDS MODULE - getChordsBySearch: artist: ${artist}, track: ${track}`);

        if (checkES) {
            const esResults = await ElasticSearchModule.searchTrack(artist, track);
            if (!!esResults) {
                console.info('Returning ElasticSearch results.');
                esResults.fromDB = true;
                return esResults;
            }
        }

        const trackInfo = await getTrackInfo(`${artist} ${track}`);
        let results = { ...trackInfo };
        if (trackInfo.key) {
            const chords = getChordsByKey(trackInfo.key);
            const playableChords = getPlayableChords(chords, COMBINATION_CODES.DEFAULT)
            results = {
                ...results,
                chords,
                playableChords,
                fromDB: false
            }
        }
        return results;
    },

} 

// for testing (could use rewire npm module instead...)
ChordsModule.COMBINATION_CODES = COMBINATION_CODES;

module.exports = ChordsModule;