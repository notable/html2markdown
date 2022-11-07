
/* MAIN */

type Options = {
  br?: string,
  bulletListMarker?: '-' | '+' | '*',
  codeBlockStyle?: 'indented' | 'fenced',
  emDelimiter?: '_' | '*',
  fence?: '```' | '~~~',
  headingStyle?: 'setext' | 'atx',
  hr?: string,
  linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut',
  linkStyle?: 'inlined' | 'referenced',
  strongDelimiter?: '__' | '**'
};

type TurndownOptions = import ( 'turndown' ).Options;

type TurndownService = import ( 'turndown' );

/* EXPORT */

export type {Options, TurndownOptions, TurndownService};
