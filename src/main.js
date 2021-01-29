var Memcached = require('memcached');

// Initialize Memcached
console.log('Connecting to memcached')
var memcached = new Memcached('localhost:11211');
console.log('Connected');

var totalExceedCount = 0;
var totalWithinCount = 0;
var successExceedCount = 0;
var successWithinCount = 0;

function calculateWaitPeriod(timeout, exceedExpiration) {
    var waitPeriod = timeout * 1000;
    if(exceedExpiration) {
        waitPeriod = waitPeriod + 1000;
    } else {
        waitPeriod = waitPeriod - 1000;
    }

    return waitPeriod;
}

function determineExpected(exceedExpiration, value) {
    var expected;
    if (exceedExpiration) {
        expected = 'undefined';
    } else {
        expected = value;
    }

    return expected;
}

function determineOutcome(expected, data, exceedExpiration)  {
    var outcome;
    if ((expected === data) || (exceedExpiration &&  typeof data === 'undefined' ))  {
        
        if (exceedExpiration) {
            successExceedCount += 1;
        } else {
            successWithinCount += 1;
        }

        outcome = 'SUCCESS! ';
    } else {
        outcome = 'FAILURE! ';
    }

    return outcome;
}

/**
 * Perform the test of setting a key value , wait a few amount 
 * of time and try fetching it.
 * @param {*} timeout 
 * @param {*} exceedExpiration 
 */
function test(timeout, exceedExpiration) {

    if (exceedExpiration) {
        totalExceedCount += 1;
    } else {
        totalWithinCount += 1;
    }

    var waitPeriod = calculateWaitPeriod(timeout, exceedExpiration);

    var rnd = Math.floor(Math.random() * Math.floor(100000000));
    var key = 'key-' + rnd
    var value = 'value-' + rnd

    memcached.set(key, value, timeout, function (err) { /* stuff */ });
    console.log(Date.now() + ': Set key/value ' + key + ' / ' + value);

    setTimeout(function(){ 
        memcached.get(key, function (err, data) {

            var expected = determineExpected(exceedExpiration, value);

            var outcome = determineOutcome(expected, data, exceedExpiration);

            console.log(Date.now() + ': ' + outcome + ' Expected : ' + expected + ' / got : ' + data);

        });

    }, waitPeriod);
}

var timeout = 10;

// Execute tests N times
for (var i= 0; i< 1000; i++) {

    // Test exists
    test(timeout, false);

    // Test expired
    test(timeout, true);

}

// Collect & print results
setTimeout(function(){ 
    console.log('Result exceeding: ' + successExceedCount + ' / ' + totalExceedCount + ' ( ' + (successExceedCount*100/totalExceedCount) + '%)');
    console.log('Result within: ' + successWithinCount + ' / ' + totalWithinCount + ' ( ' + (successWithinCount*100/totalWithinCount) + '%)');

    process.exit(0);
}, timeout * 2 * 1000);


