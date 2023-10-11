import { from, throwError } from 'rxjs';
import SagaSubject from './src/observable/saga-observable';
import { busMock, execMock } from './test/mocks/bus.mock';
import ErrorMock from './test/mocks/error.mock';

describe('SagaSubject', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    afterAll(() => {
        jest.resetAllMocks();
    })
    it('should exec the bus given a command, and output the response to an observable', (done) => {
        execMock.mockImplementation(() => {
            return from([{
                type: 'response'
            }]);
        });
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), (error: ErrorMock) => ({ type: 'errorCommand' }));
        const command: { type: 'command' } = { type: 'command' };
        let count = 0;
        saga.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(execMock).toHaveBeenCalledTimes(count);
                expect(execMock).toHaveBeenNthCalledWith(count, command);
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('response');
            },
            complete() {
                expect(count).toEqual(2);
                done();
            },
        });
        saga.next(command);
        saga.next(command);
        saga.complete();
    });

    it(`should exec the bus given a command, handle errors returned by the bus with the mapErrorFunction, 
    ouput the returned command to the bus, and output the response to an error observable`, (done) => {
        execMock.mockImplementationOnce(() => {
            return from([{
                type: 'response'
            }]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([{
                type: 'errorResponse'
            }]);
        });
        execMock.mockImplementationOnce(() => {
            return from([{
                type: 'response'
            }]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([{
                type: 'errorResponse'
            }]);
        });
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy);
        const command: { type: 'command' } = { type: 'command' };
        let count = 0;
        let countError = 0;
        saga.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(execMock).toHaveBeenCalledTimes(count + 2 * countError);
                expect(execMock).toHaveBeenNthCalledWith(count + 2 * countError, command);
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('response');
            },
            complete() {
                expect(count).toEqual(2);
            },
        });
        saga.toErrorObservable().subscribe({
            next(value) {
                countError += 1;
                expect(execMock).toHaveBeenCalledTimes(count + 2 * countError);
                expect(execMock).toHaveBeenNthCalledWith(count + 2 * countError, errorCommand);
                expect(mapErrorSpy).toHaveBeenCalledTimes(countError);
                expect(mapErrorSpy).toHaveBeenNthCalledWith(countError, expect.any(ErrorMock));
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('errorResponse');
            },
            complete() {
                expect(countError).toEqual(2);
                done();
            },
        });
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.complete();
    });
    it(`should exec the bus given a command, handle errors returned by the bus with the mapErrorFunction, 
    ouput the returned command to the bus, and output the response to an error observable, 
    if an unexpected error occurs in error command pipeline, it's handled as error in error observable`, (done) => {
        execMock.mockImplementationOnce(() => {
            return from([{
                type: 'response'
            }]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([{
                type: 'response'
            }]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([{
                type: 'errorResponse'
            }]);
        });
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy);
        const command: { type: 'command' } = { type: 'command' };
        let count = 0;
        let countError = 0;
        let countUnexpectedError = 0;
        saga.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(execMock).toHaveBeenCalledTimes(count + 2 * (countError + countUnexpectedError));
                expect(execMock).toHaveBeenNthCalledWith(count + 2 * (countError + countUnexpectedError), command);
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('response');
            },
            complete() {
                expect(count).toEqual(2);
            },
        });
        saga.toErrorObservable().subscribe({
            next(value) {
                countError += 1;
                expect(execMock).toHaveBeenCalledTimes(count + 2 * (countError + countUnexpectedError));
                expect(execMock).toHaveBeenNthCalledWith(count + 2 * (countError + countUnexpectedError), errorCommand);
                expect(mapErrorSpy).toHaveBeenCalledTimes(countError + countUnexpectedError);
                expect(mapErrorSpy).toHaveBeenNthCalledWith(countError + countUnexpectedError, expect.any(ErrorMock));
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('errorResponse');
            },
            complete() {
                expect(countError).toEqual(1);
                expect(count).toEqual(2);
                expect(countUnexpectedError).toEqual(1);
                done();
            },
        });
        saga.toUnexpectedErrorObservable().subscribe({
            next(value) {
                countUnexpectedError += 1;
                expect(value).toBeInstanceOf(ErrorMock);
            },
            complete() {
                expect(countUnexpectedError).toEqual(1);
            },
        });
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.complete();
    });
})