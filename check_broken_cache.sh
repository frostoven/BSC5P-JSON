#!/bin/sh
#
# +--------------------------------------------------------------------------+ #
# | Prints the contents of files in simbad.u-strasbg.fr_cache that are       | #
# | missing expected header information.                                     | #
# |                                                                          | #
# | At the time of writing, these are:                                       | #
# | SN1848                                                                   | #
# | SN1876                                                                   | #
# | SN1891                                                                   | #
# | SN1899                                                                   | #
# | SN1903                                                                   | #
# | (the above may also be referred to by NOVA names, ex. NOVA1848)          | #
# |                                                                          | #
# | All items reported this way will need to be adjusted manually.           | #
# +--------------------------------------------------------------------------+ #
#

cd simbad.u-strasbg.fr_cache
grep -L 'C\.D\.S' * | while read l; do cat "$l"; done


