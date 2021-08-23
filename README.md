## Bright Star Catalogue in JSON format

Contains the complete BSC5P (Bright Star Catalog, 5th Edition) converted to
JSON format. All original data is preserved. Acronyms avoided where possible
to make things a tad more readable.

The script used to perform the conversion is included in this repo in case
anyone needs the data adjusted (see `catalogToJson.js`).

Fields saved as camel case to be JavaScript appropriate. Two data files are
included: one prettified, and one not prettified.

This repo came into existence because of a lack of ready-made resources while
working on the [Cosmosis game project](https://github.com/aggregate1166877/Cosmosis)
(and I can see why there are no complete JSON sources - conversions done here
are over 6x larger).

## Description
Excerpt [from original](https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html):
> **Overview**
> 
> The BSC5P database table contains data derived from the Bright Star Catalog, 5th Edition, preliminary, which is widely used as a source of basic astronomical and astrophysical data for stars brighter than magnitude 6.5. The database contains the identifications of included stars in several other widely-used catalogs, double- and multiple-star identifications, indication of variability and variable-star identifiers, equatorial positions for B1900.0 and J2000.0, galactic coordinates, UBVRI photoelectric photometric data when they exist, spectral types on the Morgan-Keenan (MK) classification system, proper motions (J2000.0), parallax, radial- and rotational-velocity data, and multiple-star information (number of components, separation, and magnitude differences) for known non-single stars.
> 
> **References**
> 
> Hoffleit, D. and Warren, Jr., W.H., 1991, "The Bright Star Catalog, 5th Revised Edition (Preliminary Version)".
> 
> **Provenance**
> 
> This table was created by the HEASARC in 1995 based upon a file obtained from either the ADC or the CDS. A number of revisions have been made by the HEASARC to this original version, e.g., celestial positions were added for the 14 non-stellar objects which have received HR numbers: HR 92, 95, 182, 1057, 1841, 2472, 2496, 3515, 3671, 6309, 6515, 7189, 7539 and 8296. In January 2014, the very incorrect position for HR 3671 = NGC 2808 was fixed (the Declination is -65 degrees not +65 degrees!), and smaller corrections were made to the positions of HR 2496, 3515 and 6515 so as to bring them in better agreement with the positions listed in SIMBAD and NED

## Legal
Use of catalog data subject to [HEASARC](https://heasarc.gsfc.nasa.gov/) terms of use.

Scripts written to facilitate conversion released to public domain under CC0.
