import { IError } from "../../src/error/error.interface";

export default class ErrorMock implements IError {
    type: 'mock';
    data: {test: 'test'};
    previous: undefined;
    constructor() {
        this.type = 'mock';
        this.data = {test: 'test'};
        this.previous = undefined;
    }
}