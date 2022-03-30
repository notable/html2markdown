
/* IMPORT */

import mime2ext from 'mime2ext';

/* MAIN */

const Mime = {

  /* API */

  getExtension: ( mime: string ): string => {

    const ext = mime2ext ( mime );

    return ext ? `.${ext}` : '';

  },

  isImage: ( mime: string ): boolean => {

    return mime.includes ( 'image' );

  }

};

/* EXPORT */

export default Mime;
