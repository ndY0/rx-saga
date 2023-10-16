import { from, throwError } from 'rxjs';
import SagaSubject from './saga-observable';
import { busMock, execMock } from '../mocks/bus.mock';
import ErrorMock from '../mocks/error.mock';

describe('SagaSubject', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    afterAll(() => {
        jest.resetAllMocks();
    })
    it('should exec the bus given a command, and output the response to an observable', (done) => {
        const response = {
            type: 'response'
        };
        execMock.mockImplementation(() => {
            return from([response]);
        });
        const mapResponseSpy = jest.fn<{ type: 'response' }, [{ type: 'response' }]>((arg) => arg);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), (error: ErrorMock) => ({ type: 'errorCommand' }), mapResponseSpy, (arg) => arg);
        const command: { type: 'command' } = { type: 'command' };
        let count = 0;
        saga.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(execMock).toHaveBeenCalledTimes(count);
                expect(execMock).toHaveBeenNthCalledWith(count, command);
                expect(mapResponseSpy).toHaveBeenCalledTimes(count);
                expect(mapResponseSpy).toHaveBeenNthCalledWith(count, response);
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
        const response = {
            type: 'response'
        };
        const errorResponse = {
            type: 'errorResponse'
        };
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const mapResponseSpy = jest.fn<{ type: 'response' }, [{ type: 'response' }]>((arg) => arg);
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse' }, [{ type: 'errorResponse' }]>((arg) => arg);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy, mapResponseSpy, mapErrorResponseSpy);
        const command: { type: 'command' } = { type: 'command' };
        let count = 0;
        let countError = 0;
        saga.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(execMock).toHaveBeenCalledTimes(count + 2 * countError);
                expect(execMock).toHaveBeenNthCalledWith(count + 2 * countError, command);
                expect(mapResponseSpy).toHaveBeenCalledTimes(count);
                expect(mapResponseSpy).toHaveBeenNthCalledWith(count, response);
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
                expect(mapErrorResponseSpy).toHaveBeenCalledTimes(countError);
                expect(mapErrorResponseSpy).toHaveBeenNthCalledWith(countError, errorResponse);
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
        const response = {
            type: 'response'
        };
        const errorResponse = {
            type: 'errorResponse'
        };
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const mapResponseSpy = jest.fn<{ type: 'response' }, [{ type: 'response' }]>((arg) => arg);
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse' }, [{ type: 'errorResponse' }]>((arg) => arg);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy, mapResponseSpy, mapErrorResponseSpy);
        const command: { type: 'command' } = { type: 'command' };
        let count = 0;
        let countError = 0;
        let countUnexpectedError = 0;
        saga.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(execMock).toHaveBeenCalledTimes(count + 2 * (countError + countUnexpectedError));
                expect(execMock).toHaveBeenNthCalledWith(count + 2 * (countError + countUnexpectedError), command);
                expect(mapResponseSpy).toHaveBeenCalledTimes(count);
                expect(mapResponseSpy).toHaveBeenNthCalledWith(count, response);
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
                expect(mapErrorResponseSpy).toHaveBeenCalledTimes(countError);
                expect(mapErrorResponseSpy).toHaveBeenNthCalledWith(countError, errorResponse);
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
    it('should execute an error command against the bus, if one is provided to te error method', (done) => {
        const errorResponse = {
            type: 'errorResponse'
        };
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const mapResponseSpy = jest.fn<{ type: 'response' }, [{ type: 'response' }]>((arg) => arg);
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse' }, [{ type: 'errorResponse' }]>((arg) => arg);
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy, mapResponseSpy, mapErrorResponseSpy);
        let countError = 0;
        saga.toErrorObservable().subscribe({
            next(value) {
                countError += 1;
                expect(execMock).toHaveBeenCalledTimes(countError);
                expect(execMock).toHaveBeenNthCalledWith(countError, errorCommand);
                expect(mapErrorResponseSpy).toHaveBeenCalledTimes(countError);
                expect(mapErrorResponseSpy).toHaveBeenNthCalledWith(countError, errorResponse);
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('errorResponse');
            },
            complete() {
                expect(countError).toEqual(1);
                done();
            },
        });
        saga.error(errorCommand);
        saga.complete();
    });
    it('should propagate an unexpected error , if one is provided to te unexpectedError method', (done) => {
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const unexpectedError = new ErrorMock();
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const mapResponseSpy = jest.fn<{ type: 'response' }, [{ type: 'response' }]>((arg) => arg);
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse' }, [{ type: 'errorResponse' }]>((arg) => arg);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy, mapResponseSpy, mapErrorResponseSpy);
        let countUnexpectedError = 0;
        saga.toUnexpectedErrorObservable().subscribe({
            next(value) {
                countUnexpectedError += 1;
                expect(value).toBeInstanceOf(ErrorMock);
            },
            complete() {
                expect(countUnexpectedError).toEqual(1);
                done();
            },
        });
        saga.unexpectedError(unexpectedError);
        saga.complete();
    });

    it('should compose operators with pipe method, and return a SagaSubject', (done) => {
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const identityOperator1 = jest.fn<SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>, [SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>]>((saga) => saga);
        const identityOperator2 = jest.fn<SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>, [SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>]>((saga) => saga);
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const mapResponseSpy = jest.fn<{ type: 'response' }, [{ type: 'response' }]>((arg) => arg);
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse' }, [{ type: 'errorResponse' }]>((arg) => arg);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy, mapResponseSpy, mapErrorResponseSpy);
        const piped = saga.pipe(identityOperator1, identityOperator2);
        expect(piped).toBeInstanceOf(SagaSubject);
        expect(piped).toEqual(saga);
        expect(identityOperator1).toHaveBeenCalledTimes(1);
        expect(identityOperator1).toHaveBeenNthCalledWith(1, saga);
        expect(identityOperator2).toHaveBeenCalledTimes(1);
        expect(identityOperator2).toHaveBeenNthCalledWith(1, saga);
        done();
    });
    it('should allow to lift a sagasubject inner bus to provide it to a downstream sagasubject', (done) => {
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const mapErrorSpy = jest.fn((error: ErrorMock) => errorCommand);
        const mapResponseSpy = jest.fn<{ type: 'response' }, [{ type: 'response' }]>((arg) => arg);
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse' }, [{ type: 'errorResponse' }]>((arg) => arg);
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorSpy, mapResponseSpy, mapErrorResponseSpy);
        const newSagaConstructor = saga.liftBus(SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>);
        expect(newSagaConstructor).toBeInstanceOf(Function);
        const newSaga = newSagaConstructor(mapErrorSpy, mapResponseSpy, mapErrorResponseSpy);
        expect(newSaga).toBeInstanceOf(SagaSubject);
        expect(newSaga).not.toEqual(saga);
        done();
    });
})