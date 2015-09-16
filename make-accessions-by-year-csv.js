'use strict';

var _ = require( 'lodash' );
var csv = require( './lib/csv' );

// Year: ([12][0-9][0-9][0-9]) 1### or 2###
// Month: ([01][0-9]) 01 thru 12
// Day: ([0123][0-9]) 01 thru 31
var YYYY_MM_DD = /^([12][0-9][0-9][0-9])-([01][0-9])-([0123][0-9])$/;

var YEAR_REGEX = /\d{4}/;

console.log( 'Reading dated-works.csv...' );

csv.read( __dirname + '/dated-works.csv' ).then(function( data ) {
  var worksByYear = _.chain( data )
    .filter(function( work ) {
      // Remove works with no, invalid or mis-parsed year values
      return ! ! work.year;
    })
    .map(function( work ) {
      // Augment work with yearAcquired property
      work.yearAcquired = YEAR_REGEX.exec( work.dateAcquired );
      return work;
    })
    .groupBy( 'yearAcquired' )
    .mapValues(function( works, year ) {
      return {
        untitled: _.filter( works, function( work ) {
          return !!work.untitled;
        }).length,
        total: works.length
      };
    })
    .value();

  var accessionsByYear = _.range( 1929, 2015 ).map(function( year ) {
    return {
      year: year,
      untitledWorks: worksByYear[ year ].untitled,
      allWorks: worksByYear[ year ].total
    };
  });
  // console.log( worksByYear );
  csv.write( 'accessions-by-year.csv', accessionsByYear );
});
