# JSON Build Instructions

## Info

The heart of this catalogue is based on the info stored in the `original_bsc5p`
directory, which is a basic dump of all stars we can see with the naked eye
from Earth.

It lacks a lot of very important data, including parallax and spectral
information. Various scripts in this repo augment that catalogue with
additional data for a more complete bright star dataset.

## Rebuilding bsc5p.json

The first step is to convert the catalogue in `original_bsc5p/catalog` to JSON
format.

You may convert `original_bsc5p/catalog` to `bsc5p.json` by running the
following command:
```bash
node catalogToJson.js
```

The script should take around 2 seconds to complete on fast systems.

## SIMBAD Cache

We augment the above catalogue with information from
[SIMBAD](http://simbad.u-strasbg.fr/).

This repo comes with SIMBAD cache already pre-downloaded in the
`simbad.u-strasbg.fr_cache` directory. Unless you need very recent up-to-date
information, you may skip redownloading cache.

### Downloading

**Note: Redownloading cache takes around 6 hours.**

To download new cache, first delete all files in the
`simbad.u-strasbg.fr_cache` directory. The downloader will skip existing files.

Then, run the following script:
```bash
node cacheBsc5pSimbadStarData.js
```

The downloader will use the data stored in `bsc5p.json` to query SIMBAD for
information on each star, and then store the data dump of each query in
`simbad.u-strasbg.fr_cache` for further processing.

Once the download is done, we need to check for broken files. Run the following
command:
```bash
./check_broken_cache.sh
```

Use the output to make note of missing data. You'll need to manually fix any
missing data.

## Building bsc5p_extra.json

The next step is to merge the original catalogue JSON with the SIMBAD cache.
Doing so gives us parallax and spectral information not present in the base
`bsc5p.json` file.

To do so, run the following command:
```bash
node enrichStarData.js
```

This will generate a new file, `bsc5p_extra.json`, which contains information
from both `bsc5p.json` and SIMBAD cache.
