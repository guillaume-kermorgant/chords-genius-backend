'use strict'

const NotesModule = require('../../../src/server/modules/notes');

describe('modules: chords', () => {

    test('getNoteLevel returns right note level',  () => {

        expect(NotesModule.getNoteLevel('B')).toEqual(2);
        expect(NotesModule.getNoteLevel('C#')).toEqual(4);
        expect(NotesModule.getNoteLevel('D♭')).toEqual(4);
        expect(NotesModule.getNoteLevel('G')).toEqual(10);
        expect(NotesModule.getNoteLevel('G#')).toEqual(11);
        expect(NotesModule.getNoteLevel('A')).toEqual(0);
        expect(NotesModule.getNoteLevel('A♭')).toEqual(11);
    });

    test('getNoteLevel should error when note is not valid', (done) => {

        const note = 'K';
        try {
            NotesModule.getNoteLevel(note);
            done('Error: getNoteLevel should throw an error whe passed key is not valid');
        }
        catch (err) {
            expect(err.message).toInclude(`Note ${note} is not valid`);
        }

        done();
    });

    test('getNoteWithInterval should return the right note', () => {

        let inputNote = 'A';
        let interval = 2;
        expect(NotesModule.getNoteWithInterval(inputNote, interval)).toEqual('B');

        inputNote = 'E♭';
        interval = 2;
        expect(NotesModule.getNoteWithInterval(inputNote, interval)).toEqual('F');

        inputNote = 'C#';
        interval = 2;
        expect(NotesModule.getNoteWithInterval(inputNote, interval)).toEqual('D#');
    });

    test('getNoteWithInterval should error when note is not valid', (done) => {

        const inputNote = 'K';
        try {
            NotesModule.getNoteWithInterval(inputNote, 2);
            done('Error: getNoteWithInterval should throw an error whe passed key is not valid');
        }
        catch (err) {
            expect(err.message).toInclude(`Note ${inputNote} is not valid`);
        }

        done();
    });
});