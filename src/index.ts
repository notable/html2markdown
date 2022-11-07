
/* IMPORT */

import Mime from './mime';
import turndown from './turndown';
import turndownPluginTables from './turndown.plugin.tables';
import turndownPluginTasks from './turndown.plugin.tasks';
import {isElement} from './utils';
import type {Options, TurndownOptions, TurndownService} from './types.js';

/* MAIN */

// Custom elements are transformed into regular non-empty "<div>" elements, otherwise they will be ignored

const html2markdown = ( html: string, options?: TurndownOptions ): string => {

  /* REGEX - BEFORE */

  html = html.replace ( /<!DOCTYPE(.*?)>/g, '' ) // Remove HTML doctype
  html = html.replace ( /<\?xml(.*?)>/g, '' ) // Remove XML thing //TODO: What's it actually called?
  html = html.replace ( /<head>([^]*?)<\/head>/gi, '' ) // Removing HTML head
  html = html.replace ( /<div>(\s*)<\/div>/g, '' ) // Remove empty divs
  html = html.replace ( /(<div>(\s*)<br ?\/>(\s*)<\/div>){2,}/g, '<div><br /></div>' ); // Remove extra line breaks
  html = html.replace ( /<en-media([^>]+)><\/en-media>/g, '<div node="EN-MEDIA"$1>placeholder</div>' ); // Preserving `<en-media>`
  html = html.replace ( /<en-todo checked="true"(.*?)\/?>/g, '<input type="checkbox" checked />' ) // Replace enex checked checkbox
  html = html.replace ( /<en-todo checked="false"(.*?)\/?>/g, '<input type="checkbox" />' ) // Replace enex unchecked checkbox
  html = html.replace ( /<li>\s*<input(.*?)type="checkbox"([^>]*?)checked(.*?)>/g, '<li> [x] ' ) // Replace checked checkbox
  html = html.replace ( /<li>\s*<input(.*?)type="checkbox"(.*?)>/g, '<li> [ ] ' ) // Replace unchecked checkbox
  html = html.replace ( /<input(.*?)type="checkbox"([^>]*?)checked(.*?)>/g, '- [x] ' ) // Replace checked checkbox
  html = html.replace ( /<input(.*?)type="checkbox"(.*?)>/g, '- [ ] ' ) // Replace unchecked checkbox
  html = html.replace ( /<\/?en-(\w+)(.*?)>/g, '' ); // Remove enex tags

  /* TURNDOWN */

  const service: TurndownService = turndown ( options );

  service.use ( turndownPluginTables );
  service.use ( turndownPluginTasks );

  service.addRule ( 'strikethrough', {
    filter: ['del', 's'],
    replacement: str => {
      return `~~${str}~~`;
    }
  });

  service.addRule ( 'subscript', {
    filter: ['sub'],
    replacement: str => {
      return `~${str}~`;
    }
  });

  service.addRule ( 'superscript', {
    filter: ['sup'],
    replacement: str => {
      return `^${str}^`;
    }
  });

  service.addRule ( 'alignment', {
    filter: node => node.nodeName !== 'TABLE' && node.nodeName !== 'TR' && node.nodeName !== 'TD' && node.nodeName !== 'TH' && ( node.getAttribute ( 'style' ) || '' ).includes ( 'text-align:' ),
    replacement: ( str, element ) => {
      if ( !isElement ( element ) ) return str;
      str = str.trim ();
      if ( !str.length ) return '';
      const style = element.getAttribute ( 'style' );
      if ( !style ) return '';
      const alignment = style.match ( /text-align:\s*(\S+?);/ );
      if ( !alignment ) return `${str}\n\n`;
      const nodeName = element.nodeName;
      const tag = /^h\d$/i.test ( nodeName ) ? nodeName.toLowerCase () : 'p';
      if ( str.includes ( '\n' ) ) str = `\n\n${str}\n\n`;
      return `<${tag} align="${alignment[1]}">${str}</${tag}>\n\n`;
    }
  });

  service.addRule ( 'code-enex', {
    filter: node => node.nodeName === 'DIV' && ( node.getAttribute ( 'style' ) || '' ).includes ( '-en-codeblock' ),
    replacement: str => {
      str = str.replace ( /^[\r\n]+/, '' ).replace ( /[\r\n]+$/, '' );
      if ( !str.length ) return '';
      str = str.replace ( /<(?:.|\n)*?>/gm, '' );
      str = str.includes ( '\n' ) ? `\n\n\`\`\`\n${str}\n\`\`\`\n` : `\`${str}\``;
      return str;
    }
  });

  service.addRule ( 'media-enex', {
    filter: node => node.nodeName === 'DIV' && node.getAttribute ( 'node' ) === 'EN-MEDIA' && !!node.getAttribute ( 'hash' ) && !!node.getAttribute ( 'type' ),
    replacement: ( str, element ) => {
      if ( !isElement ( element ) ) return str;
      const hash = element.getAttribute ( 'hash' );
      const type = element.getAttribute ( 'type' ) || '';
      const filename = `${hash}${Mime.getExtension ( type )}`;
      const isImage = Mime.isImage ( type );
      if ( isImage ) {
        return `<img src="@attachment/${filename}" />`;
      } else  {
        return `<a href="@attachment/${filename}">${filename}</a>`;
      }
    }
  });

  service.addRule ( 'mixed', {
    filter: ['font', 'span'],
    replacement: ( str, element ) => {
      if ( !isElement ( element ) ) return str;
      if ( !str.trim () ) return '';
      /* STYLE */
      const style = element.getAttribute ( 'style' );
      let newStyle = '';
      if ( style ) {
        /* FORMATTING */
        if ( style.match ( /text-decoration: underline/ ) ) { // Underline
          str = `<u>${str}</u>`;
        }
        if ( style.match ( /text-decoration: line-through/ ) ) { // Strikethrough
          str = `~~${str}~~`;
        }
        if ( style.match ( /font-style: italic/ ) ) { // Italic
          str = `_${str}_`;
        }
        if ( style.match ( /font-weight: bold/ ) ) { // Bold
          str = `**${str}**`;
        }
        /* HEADING */
        if ( str.match ( /^[^#]|>#/ ) ) { // Doesn't contain an heading
          const match = style.match ( /font-size: (\d+)px/i );
          if ( match ) {
            const px = Number ( match[1] );
            if ( px >= 48 ) { // H1
              str = `# ${str}`;
            } else if ( px >= 36 ) { // H2
              str = `## ${str}`;
            } else if ( px >= 24 ) { // H3
              str = `### ${str}`;
            } else if ( px >= 14 ) { // Normal
            } else if ( px >= 12 ) { // Small
              str = `<small>${str}</small>`;
            } else { // Very Small
              str = `<small><small>${str}</small></small>`;
            }
          }
        }
        /* BACKGROUND COLOR */
        const backgroundColor = style.match ( /background-color: ([^;]+);/ );
        if ( backgroundColor && backgroundColor[1] !== 'rgb(255, 255, 255)' && backgroundColor[1] !== '#ffffff' ) {
          newStyle += backgroundColor[0];
        }
      }
      /* COLOR */
      const colorAttr = element.getAttribute ( 'color' ); // Color
      if ( colorAttr && colorAttr !== '#010101' ) {
        newStyle += `color: ${colorAttr};`
      }
      if ( style ) {
        const colorStyle = style.match ( /[^-]color: ([^;]+);/ );
        if ( colorStyle && colorStyle[1] !== '#010101' ) {
          newStyle += `color: ${colorStyle[1]};`;
        }
      }
      /* NEW STYLE */
      if ( newStyle ) {
        str = `<span style="${newStyle}">${str}</span>`;
      }
      return str;
    }
  });

  service.keep ([ 'kbd', 'mark', 'small', 'u' ]);

  html = service.turndown ( html );

  /* REGEX - AFTER */

  html = html.replace ( /\\((-|\*|\+) )/g, '$1' ) // Unescape unordered lists
  html = html.replace ( /\\\[([^\]]*?)\\\] /g, '[$1] ' ) // Unescape square brackets
  html = html.replace ( /\\\_/g, '_' ) // Unescape underscores
  html = html.replace ( /^(-|\*|\+)\s+/gm, '$1 ' ) // Remove extra whitespace from unordered lists
  html = html.replace ( /^((?:-|\*|\+) .*)\n\n(?=(?:-|\*|\+) )/gm, '$1\n' ) // Remove extra whitespace between unordered lists items
  html = html.replace ( /^(\d+\.)\s+/gm, '$1 ' ) // Remove extra whitespace from ordered lists
  html = html.replace ( /(\s*\n\s*){3,}/g, '\n\n' ) // Remove extra new lines
  html = html.replace ( /\n\n<br \/>\n\n(-|\*|\+) /g, '\n\n$1 ' ) // Remove line breaks before lists
  html = html.replace ( /[^\S\r\n]+$/gm, '' ) // Remmoving trailing whitespaces for each line
  html = html.trim (); // Removing tailing/trailing whitespaces

  /* RETURN */

  return html;

};

/* EXPORT */

export default html2markdown;
export type {Options};
