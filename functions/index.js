const functions = require("firebase-functions").region('europe-west1');
const { scheduledFunction } = require('./app/job');

exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    return response.end();
});

exports.scheduledFunction = scheduledFunction;