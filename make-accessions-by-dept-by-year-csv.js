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
      // convert dateAcquired from a Y-M-D timestamp to just a year
      work.dateAcquired = YEAR_REGEX.exec( work.dateAcquired )[ 0 ];
      // Rule out a special case to lump Architecture & Design - Image Archive
      // in with Architecture & Design
      work.department = work.department.replace( ' - Image Archive', '' );
      return _.pick( work, [
        'artist',
        'department',
        'id',
        'untitled',
        'dateAcquired',
        'year'
      ]);
    })
    .groupBy( 'dateAcquired' )
    .value();

  console.log( _.countBy( data, 'department' ) );

  var columns = [
    'year',
    'Architecture & Design',
    'Drawings',
    'Film',
    'Fluxus Collection',
    'Media and Performance Art',
    'Painting & Sculpture',
    'Photography',
    'Prints & Illustrated Books',
    'total',
    'untitled'
  ];

  function makeEmptyCounts() {
    return _.reduce( columns, function( counts, columnKey ) {
      counts[ columnKey ] = 0;
      return counts;
    }, {});
  }

  // Sorting is probably unneeded, but it's trivial for an array of years
  // and it provides some security that the generated CSV will be ordered
  var years = _.keys( worksByYear ).sort(function( a, b ) {
    return +a - +b;
  }).map(function( year ) {
    var counts = _.reduce( worksByYear[ year ], function( memo, work ) {
      // If the department's count exists, increment it: otherwise set it to 1
      // to initialize the counter
      memo[ work.department ] = memo[ work.department ] ? memo[ work.department ] + 1 : 1;
      if ( work.untitled ) {
        memo.untitled = memo.untitled ? memo.untitled + 1 : 1;
      }
      return memo;
    }, makeEmptyCounts() );

    console.log( year + '\n' );
    console.log( worksByYear[year].length, counts );
    counts.total = worksByYear[ year ].length;
    counts.year = year;
    return counts;
  });

  csv.write( 'week4/accessions-by-dept-by-year.csv', years, columns );
});
