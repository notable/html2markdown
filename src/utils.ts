
/* MAIN */

const isElement = ( value: Node ): value is Element => {

  return ( typeof value === 'object' && value !== null && value.nodeType === 1 );

};

/* EXPORT */

export {isElement};
