import { Observable, from, mergeMap, throwError } from "rxjs";
import { busMock, execMock } from "../mocks/bus.mock";
import ErrorMock from "../mocks/error.mock";
import SagaSubject from "../observable/saga-observable";
import mergeLink from "./merge-link";

describe('mergeLink', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    afterAll(() => {
        jest.resetAllMocks();
    })
    it(`should allow to map the previous response to a new Observable of commands`, (done) => {
        const response = { type: 'response' };
        const response2 = { type: 'response2' };
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => ({ type: 'errorCommand' }));
        const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => ({ type: 'errorResponse' }));
        const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
        const command: { type: 'command' } = { type: 'command' };
        const command2: { type: 'command2' } = { type: 'command2' };
        const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => from([command2, command2, command2, command2]));
        const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => ({ type: 'errorCommand' }));
        const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => ({ type: 'errorCommand2' }));
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => ({ type: 'errorResponse2' }));
        const mapResponseSpy = jest.fn<{ type: 'response2' }, [any]>((response: any) => ({ type: 'response2' }));
        let count = 0;
        const downstream = saga.pipe(mergeLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
        downstream.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('response2');
            },
            complete() {
                expect(count).toEqual(8);
                expect(execMock).toHaveBeenCalledTimes(count + Math.ceil(count / 5));
                for (let index = 1; index < count + Math.ceil(count / 5) + 1; index++) {
                    if (index === 0 || (index - 1) % 5 === 0) {
                        expect(execMock).toHaveBeenNthCalledWith(index, command);
                    } else {
                        expect(execMock).toHaveBeenNthCalledWith(index, command2);
                    }
                }
                expect(mapSpy).toBeCalledTimes(count / 4)
                for (let index = 1; index < count / 4; index++) {
                    expect(mapSpy).toHaveBeenNthCalledWith(index, response);

                }
                done();
            },
        });
        saga.next(command);
        saga.next(command);
        saga.complete();
    });
    it(`should allow to lift the downstream errors from the mapped Observable of commands`, (done) => {
        const response: { type: 'response' } = { type: 'response' };
        const response2: { type: 'response2' } = { type: 'response2' };
        const errorResponse: {
            type: 'errorResponse'
        } = {
            type: 'errorResponse'
        };
        const errorResponse2: {
            type: 'errorResponse2'
        } = {
            type: 'errorResponse2'
        };
        // first fully working pipe
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // failing test
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        // first passing
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // second failing
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        // third successfull
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // fourth failing
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });

        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        const command: { type: 'command' } = { type: 'command' };
        const command2: { type: 'command2' } = { type: 'command2' };
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const errorCommand2: { type: 'errorCommand2' } = { type: 'errorCommand2' };
        const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => (errorCommand));
        const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => (errorResponse));
        const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
        const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => from([command2, command2, command2, command2]));
        const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => (errorCommand));
        const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => (errorCommand2));
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => (errorResponse2));
        const mapResponseSpy = jest.fn<{ type: 'response2' }, [any]>((response: any) => (response2));
        let count = 0;
        let countError = 0;
        const downstream = saga.pipe(mergeLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
        downstream.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('response2');
            },
            complete() {
                expect(count).toEqual(10);
                expect(execMock).toHaveBeenCalledTimes(19);
                expect(execMock).toHaveBeenNthCalledWith(1, command);
                expect(execMock).toHaveBeenNthCalledWith(2, command2);
                expect(execMock).toHaveBeenNthCalledWith(3, command2);
                expect(execMock).toHaveBeenNthCalledWith(4, command2);
                expect(execMock).toHaveBeenNthCalledWith(5, command2);
                expect(execMock).toHaveBeenNthCalledWith(6, command);
                expect(execMock).toHaveBeenNthCalledWith(7, command2);
                expect(execMock).toHaveBeenNthCalledWith(8, command2);
                expect(execMock).toHaveBeenNthCalledWith(9, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(10, errorCommand);
                expect(execMock).toHaveBeenNthCalledWith(11, command2);
                expect(execMock).toHaveBeenNthCalledWith(12, command2);
                expect(execMock).toHaveBeenNthCalledWith(13, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(14, errorCommand);
                expect(execMock).toHaveBeenNthCalledWith(15, command);
                expect(execMock).toHaveBeenNthCalledWith(16, command2);
                expect(execMock).toHaveBeenNthCalledWith(17, command2);
                expect(execMock).toHaveBeenNthCalledWith(18, command2);
                expect(execMock).toHaveBeenNthCalledWith(19, command2);
                expect(mapSpy).toHaveBeenCalledTimes(3);
                expect(mapSpy).toHaveBeenNthCalledWith(1, response);
                expect(mapSpy).toHaveBeenNthCalledWith(2, response);
                expect(mapSpy).toHaveBeenNthCalledWith(3, response);
                done();
            },
        });
        saga.toErrorObservable().subscribe({
            next(value) {
                countError += 1;
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('errorResponse');
            },
            complete() {
                expect(countError).toEqual(2);
                expect(liftErrorSpy).toHaveBeenCalledTimes(2);
                expect(liftErrorSpy).toHaveBeenNthCalledWith(1, errorResponse2);
                expect(liftErrorSpy).toHaveBeenNthCalledWith(2, errorResponse2);
            },
        })
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.complete();
    });
    it('should propagate unexpected errors from downstream to upstream', (done) => {
        const response: { type: 'response' } = { type: 'response' };
        const response2: { type: 'response2' } = { type: 'response2' };
        const errorResponse: {
            type: 'errorResponse'
        } = {
            type: 'errorResponse'
        };
        const errorResponse2: {
            type: 'errorResponse2'
        } = {
            type: 'errorResponse2'
        };
        // first fully working pipe
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // failing test
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        // first passing
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // second failing
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        // third successfull
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // fourth failing unexpectedly in downstream
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
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        const command: { type: 'command' } = { type: 'command' };
        const command2: { type: 'command2' } = { type: 'command2' };
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const errorCommand2: { type: 'errorCommand2' } = { type: 'errorCommand2' };
        const error = new ErrorMock();
        const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => (errorCommand));
        const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => (errorResponse));
        const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
        const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => from([command2, command2, command2, command2]));
        const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => (errorCommand));
        const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => (errorCommand2));
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => (errorResponse2));
        const mapResponseSpy = jest.fn<{ type: 'response2' }, [any]>((response: any) => (response2));
        let count = 0;
        let countError = 0;
        let countUnexpectedError = 0;
        const downstream = saga.pipe(mergeLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
        downstream.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('response2');
            },
            complete() {
                expect(count).toEqual(10);
                expect(execMock).toHaveBeenCalledTimes(18);
                expect(execMock).toHaveBeenNthCalledWith(1, command);
                expect(execMock).toHaveBeenNthCalledWith(2, command2);
                expect(execMock).toHaveBeenNthCalledWith(3, command2);
                expect(execMock).toHaveBeenNthCalledWith(4, command2);
                expect(execMock).toHaveBeenNthCalledWith(5, command2);
                expect(execMock).toHaveBeenNthCalledWith(6, command);
                expect(execMock).toHaveBeenNthCalledWith(7, command2);
                expect(execMock).toHaveBeenNthCalledWith(8, command2);
                expect(execMock).toHaveBeenNthCalledWith(9, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(10, errorCommand);
                expect(execMock).toHaveBeenNthCalledWith(11, command2);
                expect(execMock).toHaveBeenNthCalledWith(12, command2);
                expect(execMock).toHaveBeenNthCalledWith(13, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(14, command);
                expect(execMock).toHaveBeenNthCalledWith(15, command2);
                expect(execMock).toHaveBeenNthCalledWith(16, command2);
                expect(execMock).toHaveBeenNthCalledWith(17, command2);
                expect(execMock).toHaveBeenNthCalledWith(18, command2);
                expect(mapSpy).toHaveBeenCalledTimes(3);
                expect(mapSpy).toHaveBeenNthCalledWith(1, response);
                expect(mapSpy).toHaveBeenNthCalledWith(2, response);
                expect(mapSpy).toHaveBeenNthCalledWith(3, response);
                done();
            },
        });
        saga.toErrorObservable().subscribe({
            next(value) {
                countError += 1;
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('errorResponse');
            },
            complete() {
                expect(countError).toEqual(1);
                expect(liftErrorSpy).toHaveBeenCalledTimes(1);
                expect(liftErrorSpy).toHaveBeenNthCalledWith(1, errorResponse2);
            },
        });
        saga.toUnexpectedErrorObservable().subscribe({
            next(value) {
                countUnexpectedError += 1;
                expect(value).toBeInstanceOf(ErrorMock);
                expect(value).toEqual(error);
            },
            complete() {
                expect(countUnexpectedError).toEqual(1);
            },
        })
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.complete();
    });
    it('should catch mapped errors and treat them as unexpected errors', (done) => {
        const response: { type: 'response' } = { type: 'response' };
        const response2: { type: 'response2' } = { type: 'response2' };
        const errorResponse: {
            type: 'errorResponse'
        } = {
            type: 'errorResponse'
        };
        const errorResponse2: {
            type: 'errorResponse2'
        } = {
            type: 'errorResponse2'
        };
        // first throw unexpectedly in map observable
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // failing test
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        // first passing
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // second failing
        execMock.mockImplementationOnce(() => {
            return throwError(() => new ErrorMock());
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        // third successfull
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        // fourth failing unexpectedly in downstream
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
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response2]);
        });
        const command: { type: 'command' } = { type: 'command' };
        const command2: { type: 'command2' } = { type: 'command2' };
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const errorCommand2: { type: 'errorCommand2' } = { type: 'errorCommand2' };
        let observableCount = 0;
        const error = new ErrorMock();
        const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => (errorCommand));
        const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => (errorResponse));
        const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
        const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => {
            observableCount += 1;
            return observableCount === 1 ? from([command2, command2, command2, command2]).pipe(
                mergeMap((value, index) => index === 1 ? throwError(() => new ErrorMock()) : from([value]))
            ) : from([command2, command2, command2, command2]);
        });
        const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => (errorCommand));
        const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => (errorCommand2));
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => (errorResponse2));
        const mapResponseSpy = jest.fn<{ type: 'response2' }, [any]>((response: any) => (response2));
        let count = 0;
        let countError = 0;
        let countUnexpectedError = 0;
        const downstream = saga.pipe(mergeLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
        downstream.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('response2');
            },
            complete() {
                expect(count).toEqual(7);
                expect(execMock).toHaveBeenCalledTimes(15);
                expect(execMock).toHaveBeenNthCalledWith(1, command);
                expect(execMock).toHaveBeenNthCalledWith(2, command2);
                expect(execMock).toHaveBeenNthCalledWith(3, command);
                expect(execMock).toHaveBeenNthCalledWith(4, command2);
                expect(execMock).toHaveBeenNthCalledWith(5, command2);
                expect(execMock).toHaveBeenNthCalledWith(6, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(7, errorCommand);
                expect(execMock).toHaveBeenNthCalledWith(8, command2);
                expect(execMock).toHaveBeenNthCalledWith(9, command2);
                expect(execMock).toHaveBeenNthCalledWith(10, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(11, command);
                expect(execMock).toHaveBeenNthCalledWith(12, command2);
                expect(execMock).toHaveBeenNthCalledWith(13, command2);
                expect(execMock).toHaveBeenNthCalledWith(14, command2);
                expect(execMock).toHaveBeenNthCalledWith(15, command2);
                expect(mapSpy).toHaveBeenCalledTimes(3);
                expect(mapSpy).toHaveBeenNthCalledWith(1, response);
                expect(mapSpy).toHaveBeenNthCalledWith(2, response);
                expect(mapSpy).toHaveBeenNthCalledWith(3, response);
                done();
            },
        });
        saga.toErrorObservable().subscribe({
            next(value) {
                countError += 1;
                expect(value.type).toBeDefined();
                expect(value.type).toEqual('errorResponse');
            },
            complete() {
                expect(countError).toEqual(1);
                expect(liftErrorSpy).toHaveBeenCalledTimes(1);
                expect(liftErrorSpy).toHaveBeenNthCalledWith(1, errorResponse2);
            },
        });
        saga.toUnexpectedErrorObservable().subscribe({
            next(value) {
                countUnexpectedError += 1;
                expect(value).toBeInstanceOf(ErrorMock);
                expect(value).toEqual(error);
            },
            complete() {
                expect(countUnexpectedError).toEqual(2);
            },
        })
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.complete();
    });
});