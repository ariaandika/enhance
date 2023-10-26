type MaybePromise<T> = T | Promise<T>;
type Cb<Param extends Array = [],Ret = void> = (...arg: Param) => Ret;

