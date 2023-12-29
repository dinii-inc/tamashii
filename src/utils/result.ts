export type ResultData<D> = { data: D };

export type ResultError<E> = { error: E };

export type Result<D, E> = ResultData<D> | ResultError<E>;
