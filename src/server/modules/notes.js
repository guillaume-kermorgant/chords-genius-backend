'use strict'



/*
     Notes with an attributed level, A starts at 0, then the note level is ALevel + number of halftones from A to note
*/
const NOTE_LEVELS = {
    A: 0,
    B: 2,
    C: 3,
    D: 5,
    E: 7,
    F: 8,
    G: 10
}

const ERRORS = {
    noteIsInvalid: (note) => {
        return new Error(`Note ${note} is not valid`);
    }
}

const noteIsValid = (note) => {

    if (note.length > 2) {
        return false;
    }

    // if the note has two characters, then the second one must be # or ♭
    if (note.length == 2 && !['#', '♭'].includes(note[1])) {
        return false;
    }

    // first char must be a valid plain note
    return Object.keys(NOTE_LEVELS).includes(note[0]);
}

const noteIsSharp = (note) => {
    if (!noteIsValid(note)) {
        throw ERRORS.noteIsInvalid(note);
    }
    return note.includes('#');
}

const noteIsFlat = (note) => {
    if (!noteIsValid(note)) {
        throw ERRORS.noteIsInvalid(note);
    }
    return note.includes('♭');
}

const getNoteLevel = (note) => {
    console.info(`NOTES MODULE - getNoteLevel: ${note}`);
    if (!noteIsValid(note)) {
        throw ERRORS.noteIsInvalid(note);
    }
    
    const toneVariation = noteIsSharp(note) ? 1 : (noteIsFlat(note) ? 11 : 0);
    // we call "plain note" a note with no # or ♭
    const plainNote = note[0];

    // computing the note level
    // HONESTLY, we could simply have an array with all the notes (including sharp and flat notes) and their corresponding level; there are not so many... but...
    return (NOTE_LEVELS[plainNote] + toneVariation) % 12;
}

const NotesModule = {

   getNoteLevel,

    // returns note whose level is input note + interval
    getNoteWithInterval: (inputNote, interval) => {

        if (!noteIsValid(inputNote)) {
            throw ERRORS.noteIsInvalid(inputNote);
        }

        const inputNoteLevel = getNoteLevel(inputNote);
        const targetNoteLevel = (inputNoteLevel + interval) % 12;
        // let closestNote;
        // let closestNoteLevel;
        const closestNote = Object.keys(NOTE_LEVELS).reduce((previousNote, currentNote) => {
            const previousNoteLevel = NOTE_LEVELS[previousNote];
            const currentNoteLevel = NOTE_LEVELS[currentNote];
            return Math.abs(currentNoteLevel - targetNoteLevel) < Math.abs(previousNoteLevel - targetNoteLevel) ? currentNote : previousNote;
        })

        let targetNote = closestNote;
        const closestNoteLevel = NOTE_LEVELS[closestNote];
        if (closestNoteLevel < targetNoteLevel) {
            targetNote = `${closestNote}#`;
        }
        else if (closestNoteLevel > targetNoteLevel) {
            targetNote = `${closestNote}♭'`
        }

        console.info(`getNoteWithInterval: inputNote ${inputNote}, interval: ${interval}, returned note: ${targetNote}`);
        return targetNote;
    },

    noteIsValid
} 

module.exports = NotesModule;