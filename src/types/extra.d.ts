export {}

declare global {
  type PrSwap =
    | 'innerHTML'
    | 'outerHTML'
    | 'none'
  ;

  declare namespace JSX {
    interface HtmlTag {
      ['pr-get']?: string,
      ['pr-post']?: string,
      ['pr-emit']?: keyof EnhanceEvent | string & {},
      // ['pr-put']?: string,
      // ['pr-patch']?: string,
      // ['pr-delete']?: string,

      /** selector */
      ['pr-target']?: string,
      // ['pr-load']?: string,
      ['pr-swap']?: PrSwap,

      /**
       * invalidate will fetch new data and replace current element when form succeed
       * if used in element, can be set to "url id", or just "url" to accept any id
       * if used in form, can be set true or false, form id is the id
       */
      ['pr-invalidate']?: string | boolean,

      ['pr-noreset']?: string | boolean
    }

    interface HtmlFormTag {
      /** selector */
      ['pr-include']?: string
    }

  }
}
