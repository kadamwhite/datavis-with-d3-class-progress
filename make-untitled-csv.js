'use strict';

var fs = require( 'fs' );
var csv = require( 'csv' );
var _ = require( 'lodash' );

var csv = require( './lib/csv' );


csv.read( __dirname + '/MomaArtworks.csv' ).then(function( data ) {
  console.log( 'Loaded', data.length, 'Artworks' );

  // Export for use on the node repl:
  // > var parser = require( './index' );
  // > parser.result...
  module.exports.result = data;

  // Do the filtering
  var untitledWorks = _.chain( data )
    .filter(function( work ) {
      if ( ! work.DateAcquired ) {
        // Only use rows which have a "date acquired" value
        return false;
      }
      return /untitled/i.test( work.Title );
    })
    .sortBy( 'DateAcquired' )
    .value();

  // Get a rough sense of how many unique Date values there are
  // console.log( _.countBy( untitledWorks, 'Date' ) );

  module.exports.untitledWorks = untitledWorks;

  csv.write( 'untitled.csv', untitledWorks );
});

module.exports = {};
