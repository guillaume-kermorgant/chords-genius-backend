'use strict'

const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: `http://${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}` });

const INDICES = {
    TRACKS: 'tracks'
}

if (process.env.NODE_ENV !== 'test') {
    client.ping({}, {
        requestTimeout: 30000,
    }, (error) => {
        if (error) {
            console.error(`ERROR: ElasticSearch cluster seems to be down: ${JSON.stringify(error, null, 2)}`);
            console.info('It\'s ok, ElasticSearch is only used to improve our results, but Chords Genius can work without it');
        } else {
            console.info('ElasticSearch cluster is OK!');
        }
    });
}

const ElasticSearchModule = {

    searchTrack: async (artist, track) => {
        console.info(`ElasticSearchModule - query artist: ${artist}, track: ${track}`);
        // the following query could probably be improved
        // for now, we query the track and artist fields, and we multiplies the track's score by two, while leaving the artist's score unchanged
        try {
            const { body } = await client.search({
                index: INDICES.TRACKS,
                body: {
                    query: {
                        bool: {
                            must: [
                                { term: { artistKeyword: artist.toLowerCase() } },
                                { term: { trackKeyword: track.toLowerCase() } }
                            ]
                        }
                    }
                }
            });
            console.info(`ElasicSearch result: ${JSON.stringify(body, null, 2)}`);
            if (body.hits && body.hits.hits && body.hits.hits.length > 0) {
                const parsedSources = body.hits.hits[0]._source;
                delete parsedSources.trackKeyword;
                delete parsedSources.artistKeyword;
                return parsedSources;
            }
            console.log('No result found in ElasticSearch.')
            return undefined;
        } catch (err) {
            console.error(`Error querying ElasticSearch: ${err}`);
            throw new Error(`Error querying ElasticSearch: ${err.message}`)
        }
    }
}

module.exports = ElasticSearchModule;