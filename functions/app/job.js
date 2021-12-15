const functions = require("firebase-functions").region('europe-west1');
const {main} = require('./main');

exports.scheduledFunction = functions.pubsub.schedule('30 8 * * *')
    .timeZone('Asia/Jerusalem')
    .onRun((context) => {
        main();
        return null;
    });