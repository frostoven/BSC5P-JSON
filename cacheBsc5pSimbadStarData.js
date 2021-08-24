// Downloads BSC5P data from simbad.u-strasbg.fr for use in enrichStarData.
// Requires Node.js > 10.
// Usage:
//  node cacheBsc5pSimbadStarData.js

const fs = require('fs');
const https = require('https');
const BSC5P_JSON = require('./bsc5p_min.json');
const getStarName = require('./utils/getStarName');

const CACHE_DIR = './simbad.u-strasbg.fr_cache';

// The server owners kindly requested we don't spam them. Let's limit download speed.
let downloadDelay = 350;
let nextDownloadReady = true;

function downloadData(entrySearch, callback) {
  entrySearch = encodeURI(entrySearch);

  const options = {
    hostname: 'simbad.u-strasbg.fr',
    port: 443,
    path: `/simbad/sim-id?Ident=${entrySearch}&output.format=ASCII`,
    method: 'GET',
    timeout: 5000,
  };

  const req = https.request(options, res => {
    res.setEncoding('utf8');
    let body = '';

    if (res.statusCode !== 200) {
      console.warn(`Warning: download for ${entrySearch} returned code ${res.statusCode}`);
    }

    res.on('data', chunk => {
      body += chunk;
    });

    res.on('end', () => {
      fs.writeFileSync(`${CACHE_DIR}/${entrySearch}.txt`, body);
      setTimeout(() => { callback(null); }, downloadDelay);
    });
  });

  req.on('error', error => {
    console.error(error);
    setTimeout(() => { callback(error); }, downloadDelay);
  });

  req.end();
}

console.log('=> BSC5P_JSON file has', BSC5P_JSON.length, 'items.');

const allBodies = [];
for (let i = 0, len = BSC5P_JSON.length; i < len; i++) {
  const star = BSC5P_JSON[i];
  const name = getStarName(star);

  if (!name) {
    // During tests, all had names :)
    console.log('Could not determine name for this entry:', star);
    continue;
  }

  allBodies.push(name);
}

// Skip all entries already downloaded. This process is very slow - if it
// eventually turns into an issue, might need to switch to hashmaps.
let skipCount = 0;
console.log('=> Checking existing cache.')
let alreadyExisting = fs.readdirSync(CACHE_DIR);
for (let i = 0, len = alreadyExisting.length; i < len; i++) {
  const fileName = alreadyExisting[i];

  // Here's where we removed already downloaded items from the queue:
  let bodyCount = allBodies.length;
  while (bodyCount--) {
    const entry = allBodies[bodyCount];
    if (encodeURI(entry) + '.txt' === fileName) {
      skipCount++;
      allBodies.splice(bodyCount, 1);
    }
  }
}
alreadyExisting = [];

console.log(`=> Skipping ${skipCount} already downloaded item${skipCount === 1 ? '' : 's'}.`);

let showActivity = 0;
let line = 0;
let lastRunDate = 0;
// This is loop far more complicated than it should be because the script
// originally had a bug I couldn't figure out (the 'download next file'
// callback was called on completion of every io chunk instead of every file).
// This was written to ensure we never ever EVER download more than 2 files a
// second no matter what (which it does well). If you want to modify this for
// your own purposes, rewriting it might make more sense.
const runner = setInterval(() => {
  if (showActivity++ >= 60000) {
    // Once a minute.
    console.log('Still working.');
    showActivity = 0;
  }

  if (allBodies.length < 1) {
    console.log('=> Download complete!');
    return clearInterval(runner);
  }

  if (!nextDownloadReady) {
    return;
  }
  nextDownloadReady = false;

  if (Date.now() - lastRunDate < downloadDelay) {
    setTimeout(() => {
      nextDownloadReady = true;
    }, downloadDelay + 1);

    return;
  }

  const name = allBodies.shift();
  console.log(`=> [${skipCount + line++}] Downloading data for: ${name}`);
  setTimeout(() => {
    downloadData(name, (error) => {
      if (error) {
        console.warn(`Error downloading ${name}; pushing to back of queue.`);
        allBodies.push(name);
      }
      lastRunDate = Date.now();
      nextDownloadReady = true;
    });
  }, downloadDelay + 1);
});
