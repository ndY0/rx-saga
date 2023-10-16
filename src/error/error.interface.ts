type ErrorType = IError;

export interface IError<D = any> {
    type: string;
    data: D;
    previous: ErrorType | undefined;
}