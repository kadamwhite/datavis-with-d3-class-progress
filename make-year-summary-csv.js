'use strict';

var _ = require( 'lodash' );
var csv = require( './lib/csv' );

var argv = require( 'minimist' )( process.argv.slice( 2 ) );

var YEAR_REGEX = /\d{4}/;

csv.read( __dirname + '/dated-works.csv' ).then(function( data ) {
  console.log( 'Loaded', data.length, 'Artworks' );

  // console.log( result );

  var worksForYear = _.chain( data )
    .filter(function( work ) {
      // Remove works with no, invalid or mis-parsed year values
      if ( ! work.year ) {
        return false;
      }
      // Augment work with yearAcquired property
      work.yearAcquired = +YEAR_REGEX.exec( work.dateAcquired );
      return work.yearAcquired === +argv.year;
    })
    .value();

  // // all years
  // console.log( _.countBy( data, 'department' ) );

  console.log( _.countBy( worksForYear, 'department' ) );
  var topCreditLines = _.chain( worksForYear )
    .countBy( 'creditLine' )
    .reduce(function( memo, count, key ) {
      memo.push({
        creditLine: key,
        count: count
      });
      return memo;
    }, [])
    .sortBy(function( obj ) {
      return -obj.count;
    })
    .filter(function(obj, idx, col) {
      return ( idx < 10 || idx < col / 5 );
    })
    .value();
  console.log( topCreditLines );

  var topArtists = _.chain( worksForYear )
    .countBy( 'artist' )
    .reduce(function( memo, count, key ) {
      memo.push({
        artist: key,
        count: count
      });
      return memo;
    }, [])
    .sortBy(function( obj ) {
      return -obj.count;
    })
    .filter(function(obj, idx, col) {
      return ( idx < 10 || idx < col / 5 );
    })
    .value();
  console.log( topArtists );
  // var printsAndBooks = _.where( data, {
  //   department: 'Prints & Illustrated Books'
  // });
  // console.log( _.countBy( printsAndBooks, 'creditLine' ) );

  console.log( worksForYear.length + ' works acquired in ' + argv.year + '.' );

  // csv.write( 'dated-works-1964.csv', worksForYear );
});
