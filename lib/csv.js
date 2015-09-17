'use strict';

var fs = require( 'fs' );
var csv = require( 'csv' );
var _ = require( 'lodash' );
var bluebird = require( 'bluebird' );

function readCSV( filename ) {
  return new bluebird.Promise(function( resolve, reject ) {
    var parser = csv.parse({
      auto_parse: true,
      skip_empty_lines: true,
      columns: true, // auto-discover column headers
      delimiter: ','
    }, function( err, data ) {
      if ( err ) {
        reject( err );
      } else {
        resolve( data );
      }
    });
    // Start reading & parsing the file
    fs.createReadStream( filename ).pipe( parser );
  });
}

function writeCSV( filename, data, columns ) {
  return new bluebird.Promise(function( resolve, reject ) {
    csv.stringify( data, {
      header: true,
      columns: columns ? columns : void 0
    }, function( err, csvString ) {
      fs.writeFile( filename, csvString, function( err, result ) {
        if ( err ) {
          reject( err );
        } else {
          if ( _.isArray( data ) ) {
            console.log( data.length + ' lines written to ' + filename );
          }
          resolve( result );
        }
      });
    });
  });
}

module.exports = {
  read: readCSV,
  write: writeCSV
}
