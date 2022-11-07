
/* IMPORT */

import domino from 'domino';
import {describe} from 'fava';
import fs from 'node:fs';
import path from 'node:path';
import html2markdown from '../dist/index.js';

/* HELPERS */

const convert = html => {

  class DOMParser {
    parseFromString ( html ) {
      return domino.createWindow ( html ).document;
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

    const inputPath = path.join ( process.cwd (), 'test', 'fixtures', 'input.html' );
    const outputPath = path.join ( process.cwd (), 'test', 'fixtures', 'output.md' );
    const input = fs.readFileSync ( inputPath, 'utf8' ).trimEnd ();
    const output = fs.readFileSync ( outputPath, 'utf8' ).trimEnd ();

    t.is ( convert ( input ), output );

  });

});
