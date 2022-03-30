
/* IMPORT */

const {describe} = require ( 'fava' );
const fs = require ( 'fs' );
const minidom = require ( 'minidom' );
const path = require ( 'path' );
const {default: html2markdown} = require ( '../dist' );

/* HELPERS */

const convert = html => {

  class DOMParser {
    parseFromString ( html ) {
      return minidom ( html );
    }
  }

  const options = {
    parser: DOMParser
  };

  return html2markdown ( html, options );

};

/* MAIN */

describe ( 'HTML2Markdown', it => {

  it ( 'convers HTML into markdown', t => {

    const inputPath = path.join ( __dirname, 'fixtures', 'input.html' );
    const outputPath = path.join ( __dirname, 'fixtures', 'output.md' );
    const input = fs.readFileSync ( inputPath, 'utf8' ).trimEnd ();
    const output = fs.readFileSync ( outputPath, 'utf8' ).trimEnd ();

    t.is ( convert ( input ), output );

  });

});
