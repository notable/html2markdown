# HTML2Markdown

A small function for converting HTML to Markdown.

## Install

```sh
npm install --save @notable/html2markdown
```

## Usage

```ts
import html2markdown from '@notable/html2markdown';

html2markdown ( '<b>Hello, <i>World</i>!</b>' ); // => '**Hello, _World_!**'
```

## License

- Library: MIT © Fabio Spampinato
- Turndown: MIT © [Dom Christie](https://github.com/mixmark-io/turndown/blob/master/LICENSE)
