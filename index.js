'use strict';

var fs = require( 'fs' );
var csv = require( 'csv' );
var _ = require( 'lodash' );

var parser = csv.parse({
  auto_parse: true,
  skip_empty_lines: true,
  columns: true, // auto-discover column headers
  delimiter: ','
}, function(err, data) {
  console.log( 'Loaded', data.length, 'Artworks' );

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

  csv.stringify( untitledWorks, {
    header: true
  }, function( err, d ) {
    fs.writeFileSync('untitled.csv', d);
    console.log( untitledWorks.length + ' lines written to untitled.csv' );
  });

  // Export for use on the node repl:
  // > var parser = require( './index' );
  // > parser.result...
  module.exports.result = data;
});

var stream = fs.createReadStream( __dirname + '/MomaArtworks.csv' ).pipe( parser );

module.exports = {
  stream: stream
};
