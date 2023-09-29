// This script converts original_bsc5p/catalog to json format.
//
// Requires Node.js > 10.
// Usage:
//  node catalogToJson.js

const fs = require('fs');
const readline = require('readline');

const CONVERT_FROM_FILE = 'original_bsc5p/catalog';
const RESULT_PRETTY_FILE = 'bsc5p.json';
const RESULT_MIN_FILE = 'bsc5p_min.json';
const FROM = 0;
const TO = 1;
const FIELD_NAME = 2;

// Spec described here: ftp://cdsarc.u-strasbg.fr/cats/V/50/ReadMe
// Note: in the manual they count from 1, not 0. We'll keep the numbers the
// same as in the manual to avoid needing to do constant mental conversion, and
// then subtract one from our indexes while processing the data.
const columns = [
  // [1/9110]+ Harvard Revised Number = Bright Star Number
  [1, 4, 'lineNumber'],

  // Name, generally Bayer and/or Flamsteed name
  [5, 14, 'bayerAndOrFlamsteed'],

  // Durchmusterung Identification (zone in bytes 17-19)
  [15, 25, 'dmId'],

  // [1/225300]? Henry Draper Catalog Number
  [26, 31, 'hdId'],

  // [1/258997]? SAO Catalog Number
  [32, 37, 'saoId'],

  // FK5 star Number
  [38, 41, 'fk5Id'],

  // IRflag   [I] I if infrared source
  [42, 42, 'irFlag'],

  // r_IRflag  *[ ':] Coded reference for infrared source
  [43, 43, 'rIrFlag'],

  // Multiple *[AWDIRS] Double or multiple-star code
  [44, 44, 'awdirsCode'],

  // ADS      Aitken's Double Star Catalog (ADS) designation
  [45, 49, 'adsId'],

  // ADScomp  ADS number components
  [50, 51, 'adsNumberComponents'],

  // VarID    Variable star identification
  [52, 60, 'varStarCode'],

  // h       RAh1900  ?Hours RA, equinox B1900, epoch 1900.0 (1)
  [61, 62, 'hoursRaB1900'],

  // min     RAm1900  ?Minutes RA, equinox B1900, epoch 1900.0 (1)
  [63, 64, 'minutesRaB1900'],

  // s       RAs1900  ?Seconds RA, equinox B1900, epoch 1900.0 (1)
  [65, 68, 'secondsRaB1900'],

  // DE-1900  ?Sign Dec, equinox B1900, epoch 1900.0 (1)
  [69, 69, 'signDecB1900'],

  // deg     DEd1900  ?Degrees Dec, equinox B1900, epoch 1900.0 (1)
  [70, 71, 'degreesDecB1900'],

  // arcmin  DEm1900  ?Minutes Dec, equinox B1900, epoch 1900.0 (1)
  [72, 73, 'minutesDecB1900'],

  // arcsec  DEs1900  ?Seconds Dec, equinox B1900, epoch 1900.0 (1)
  [74, 75, 'secondsDecB1900'],

  // h       RAh      ?Hours RA, equinox J2000, epoch 2000.0 (1)
  [76, 77, 'hoursRaJ2000'],

  // min     RAm      ?Minutes RA, equinox J2000, epoch 2000.0 (1)
  [78, 79, 'minutesRaJ2000'],

  // s       RAs      ?Seconds RA, equinox J2000, epoch 2000.0 (1)
  [80, 83, 'secondsRaJ2000'],

  // DE-      ?Sign Dec, equinox J2000, epoch 2000.0 (1)
  [84, 84, 'signDecJ2000'],

  // deg     DEd      ?Degrees Dec, equinox J2000, epoch 2000.0 (1)
  [85, 86, 'degreesDecJ2000'],

  // arcmin  DEm      ?Minutes Dec, equinox J2000, epoch 2000.0 (1)
  [87, 88, 'minutesDecJ2000'],

  // arcsec  DEs      ?Seconds Dec, equinox J2000, epoch 2000.0 (1)
  [89, 90, 'secondsDecJ2000'],

  // deg     GLON     ?Galactic longitude (1)
  [91, 96, 'galacticLongitude'],

  // deg     GLAT     ?Galactic latitude (1)
  [97, 102, 'galacticLatitude'],

  // mag     Vmag     ?Visual magnitude (1)
  [103, 107, 'visualMagnitude'],

  // n_Vmag    *[ HR] Visual magnitude code
  [108, 108, 'visualMagnitudeCode'],

  // u_Vmag     [ :?] Uncertainty flag on V
  [108, 109, 'visualMagnitudeUncertainty'],

  // mag     B-V      ? B-V color in the UBV system
  [110, 114, 'bvColorUbv'],

  // u_B-V      [ :?] Uncertainty flag on B-V
  [115, 115, 'bvColorUbvUncertainty'],

  // mag     U-B      ? U-B color in the UBV system
  [116, 120, 'ubColorUbv'],

  // u_U-B      [ :?] Uncertainty flag on U-B
  [121, 121, 'ubColorUbvUncertainty'],

  // mag     R-I      ? R-I   in system specified by n_R-I
  [122, 126, 'riMagnitude'],

  // n_R-I      [CE:?D] Code for R-I system (Cousin, Eggen)
  [127, 127, 'riCode'],

  // SpType   Spectral type
  [128, 147, 'spectralType'],

  // n_SpType   [evt] Spectral type code
  [148, 148, 'spectralTypeCode'],

  // arcsec/yr pmRA    *?Annual proper motion in RA J2000, FK5 system
  [149, 154, 'annualProperMotionRaJ2000Fk5'],

  // arcsec/yr pmDE     ?Annual proper motion in Dec J2000, FK5 system
  [155, 160, 'annualProperMotionDecJ2000Fk5'],

  // n_Parallax [D] D indicates a dynamical parallax, otherwise a trigonometric parallax
  [161, 161, 'parallax'],

  // arcsec  Parallax ? Trigonometric parallax (unless n_Parallax)
  [162, 166, 'trigParallax'],

  // km/s    RadVel   ? Heliocentric Radial Velocity
  [167, 170, 'heliocentricRadialVelocity'],

  // n_RadVel  *[V?SB123O ] Radial velocity comments
  [171, 174, 'heliocentricRadialVelocityComments'],

  // l_RotVel   [<=> ] Rotational velocity limit characters
  [175, 176, 'rotationalVelocityLimitChars'],

  // km/s    RotVel   ? Rotational velocity, v sin i
  [177, 179, 'rotationalVelocityVSinI'],

  // u_RotVel   [ :v] uncertainty and variability flag on RotVel
  [180, 180, 'rotationalVelocityUncertainty'],

  // mag     Dmag     ? Magnitude difference of double, or brightest multiple
  [181, 184, 'magnitudeDifference'],

  // arcsec  Sep      ? Separation of components in Dmag if occultation binary.
  [185, 190, 'componentSeparation'],

  // MultID   Identifications of components in Dmag
  [191, 194, 'componentIdentification'],

  // MultCnt  ? Number of components assigned to a multiple
  [195, 196, 'componentsAssignedToMultiple'],

  // NoteFlag [*] a star indicates that there is a note (see file notes)
  [197, 197, 'seeFileNotesFlag'],
];

// Checks that we haven't accidentally duplicated field names in columns.
(function testColumnsForDups() {
  console.log('=> Running tests before starting.');
  const allFields = {};
  let dups = 0;
  for (let i = 0, len = columns.length; i < len; i++) {
    const column = columns[i];
    const fieldName = column[FIELD_NAME];
    if (allFields[fieldName]) {
      dups++;
      console.log(`=> Error: ${fieldName} is duplicated.`);
    }
    allFields[fieldName] = true;
  }
  if (dups) {
    console.log(`=> Cannot proceed; ${dups+1} fields have the same name.`);
    process.exit();
  }
  console.log('=> All tests pass.');
})();

// Unfortunately substr and substring does not do exactly this, and the catalog
// format is complicated enough that I don't want to mess with adjustments.
// Rather just reinvent wheel.
function getStringRange(from, to, string) {
  let result = '';
  for (let i = 0, len = string.length; i < len; i++) {
    if (i >= from && i <= to) {
      result += string[i];
    }
  }
  return result;
}

const lineReader = readline.createInterface({
  input: fs.createReadStream(CONVERT_FROM_FILE),
});

console.log('=> Starting conversion.');
let lineCount = 0;
const converted = [];
lineReader.on('line', function (line) {
  // Log progress every 1000 lines.
  if (++lineCount % 1000 === 0) {
    console.log('   ... reached line', lineCount);
  }

  const jsonLine = {};
  for (let i = 0, len = columns.length; i < len; i++) {
    // Get prepared info:
    const column = columns[i];
    // Note: in the manual they count from 1, not 0. Shift counter down one.
    const from = column[FROM] - 1;
    const to = column[TO] - 1;
    const fieldName = column[FIELD_NAME];

    let value = getStringRange(from, to, line).trim();
    // The catalogue sometimes pads values. For example, instead of "33 Psc" it
    // might contain "33    Psc". The following line removes excess padding.
    value = value.split(' ').filter(Boolean).join(' ');

    // Save processed line:
    jsonLine[fieldName] = value;
  }
  converted.push(jsonLine)
});

lineReader.on('close', function () {
  console.log(`=> Conversion done (${lineCount} lines); saving files:`);

  console.log('   ...', RESULT_PRETTY_FILE);
  fs.writeFileSync(RESULT_PRETTY_FILE, JSON.stringify(converted, null, 4));

  console.log('   ...', RESULT_MIN_FILE);
  fs.writeFileSync(RESULT_MIN_FILE, JSON.stringify(converted));

  console.log('=> All done!');
});
