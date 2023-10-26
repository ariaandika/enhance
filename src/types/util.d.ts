type MaybePromise<T> = T | Promise<T>;
type Cb<const Param extends Array = [],Ret = void> = (...arg: Param) => Ret;

