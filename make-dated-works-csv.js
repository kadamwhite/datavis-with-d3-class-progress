'use strict';

var _ = require( 'lodash' );
var csv = require( './lib/csv' );


var FOUR_DIGITS_REGEXP = /\d{4}/;

function getYearFromDate( date ) {
  // Auto-pass-through dates with numeric years (something the CSV parser does
  // for values that appear strictly numeric, so '1992' -> 1992)
  if ( _.isNumber( date ) ) {
    return date;
  }

  // Clumsily normalize the year of creation by grabbing the first four consecutive
  // numbers from the work's Date field. (Yes, this is terrible.)
  var guessedDate = FOUR_DIGITS_REGEXP.exec( date );
  // return the matched year (as a number) or an empty string
  return guessedDate ? +guessedDate[ 0 ] : '';
}

// Year: ([12][0-9][0-9][0-9]) 1### or 2###
// Month: ([01][0-9]) 01 thru 12
// Day: ([0123][0-9]) 01 thru 31
var YYYY_MM_DD = /^([12][0-9][0-9][0-9])-([01][0-9])-([0123][0-9])$/;
var MM_DD_YYYY = /^([01][0-9])-([0123][0-9])-([12][0-9][0-9][0-9])$/;

function normalizeDateAcquired( work ) {
  var dateAcquired = work.DateAcquired;

  if ( YYYY_MM_DD.test( dateAcquired ) ) {
    return dateAcquired;
  }
  var matchesMonthDayYear = MM_DD_YYYY.exec( dateAcquired );
  if ( matchesMonthDayYear ) {
    // Example match object: ["12-22-1954", "12", "22", "1954"]
    return [
      matchesMonthDayYear[ 3 ],
      matchesMonthDayYear[ 1 ],
      matchesMonthDayYear[ 2 ]
    ].join( '-' );
  }
  console.warn( work );
  return dateAcquired;
}

var UNTITLED_REGEX = /untitled/i;
function isUntitled( work ) {
  if ( work.Artist.substr('Eliot Noyes') > -1 ) {
    console.log( work );
  }
  return UNTITLED_REGEX.test( work.Title );
}

csv.read( __dirname + '/MomaArtworks.csv' ).then(function( data ) {
  console.log( 'Loaded', data.length, 'Artworks' );

  console.log( '\nOld Format:' );
  console.log( _.first( data ), '\n' );

  // console.log( result );

  var datedWorks = _.chain( data )
    .filter(function( work ) {
      var date = work.Date;
      // Ignore the work if the date is missing or explicitly flagged as not dated
      // (The && in second clause is necessary because Date is sometimes a number)
      if ( ! date || ( date.indexOf && date.indexOf( 'n.d.' ) > -1 ) ) {
        return false;
      }

      // Ignore works if they have no accession date, or if they are a number (only
      // true if the dateAcquired is a year with no month or day)
      if ( ! work.DateAcquired || _.isNumber( work.DateAcquired ) ) {
        return false;
      }

      // else leave it in
      return true;
    })
    .map(function( work ) {
      // These fields are not strictly relevant to my analysis, and are omitted:
      // 'Classification',
      // 'CreditLine',
      // 'CuratorApproved',
      // 'Dimensions',
      // 'MoMANumber',
      // 'URL'
      return {
        date: work.Date,
        artist: work.Artist,
        title: work.Title,
        bio: work.Bio,
        medium: work.Medium,
        department: work.Department,
        id: work.ObjectID,
        // Flag whether the work is untitled
        untitled: isUntitled( work ),
        // Normalize the dateAcquired to YYYY-MM-DD
        dateAcquired: normalizeDateAcquired( work ),
        // Add a property for the year
        year: getYearFromDate( work.Date )
      };
    })
    .value();

  console.log( datedWorks.length + ' valid records found.' );
  console.log( '\nNew Format:' );
  console.log( datedWorks[ 0 ] );

  console.log( '\nwriting csv...' );

  csv.write( 'dated-works.csv', datedWorks );
});
