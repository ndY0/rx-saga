import { Observable, from, mergeMap, throwError } from "rxjs";
import { busMock, execMock } from "../mocks/bus.mock";
import ErrorMock from "../mocks/error.mock";
import SagaSubject from "../observable/saga-observable";
import bufferLink from "./buffer-link";

describe('bufferLink', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })
    afterAll(() => {
        jest.resetAllMocks();
    })
    // it('should allow to map the previous response to a new Observable of commands, and buffer all responses before outputing them', (done) => {
    //     const response = { type: 'response' };
    //     const response2 = { type: 'response2' };
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([[response2, response2, response2, response2]]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([[response2, response2, response2, response2]]);
    //     });
    //     const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => ({ type: 'errorCommand' }));
    //     const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => ({ type: 'errorResponse' }));
    //     const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
    //     const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
    //     const command: { type: 'command' } = { type: 'command' };
    //     const command2: { type: 'command2' } = { type: 'command2' };
    //     const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => from([command2, command2, command2, command2]));
    //     const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => ({ type: 'errorCommand' }));
    //     const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => ({ type: 'errorCommand2' }));
    //     const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => ({ type: 'errorResponse2' }));
    //     const mapResponseSpy = jest.fn<{ type: 'response2' }[], [any]>((response: any) => (response));
    //     let count = 0;
    //     const downstream = saga.pipe(bufferLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
    //     downstream.toObservable().subscribe({
    //         next(value) {
    //             count += 1;
    //             expect(value).toHaveLength(4)
    //             for (const item of value) {
    //                 expect(item.type).toBeDefined();
    //                 expect(item.type).toEqual('response2');
    //             }
    //         },
    //         complete() {
    //             expect(count).toEqual(2);
    //             expect(execMock).toHaveBeenCalledTimes(4);
    //             expect(execMock).toHaveBeenNthCalledWith(1, command);
    //             expect(execMock).toHaveBeenNthCalledWith(2, [command2, command2, command2, command2]);
    //             expect(execMock).toHaveBeenNthCalledWith(3, command);
    //             expect(execMock).toHaveBeenNthCalledWith(4, [command2, command2, command2, command2]);
    //             done();
    //         },
    //     });
    //     saga.next(command);
    //     saga.next(command);
    //     saga.complete();
    // });
    // it('should allow to lift the downstream errors from the mapped Observable of commands', (done) => {
    //     const response: { type: 'response' } = { type: 'response' };
    //     const response2: { type: 'response2' } = { type: 'response2' };
    //     const errorResponse: {
    //         type: 'errorResponse'
    //     } = {
    //         type: 'errorResponse'
    //     };
    //     const errorResponse2: {
    //         type: 'errorResponse2'
    //     } = {
    //         type: 'errorResponse2'
    //     };
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([[response2, response2, response2, response2]]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return throwError(() => new ErrorMock());
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([errorResponse2]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([errorResponse]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([[response2, response2, response2, response2]]);
    //     });
    //     const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => ({ type: 'errorCommand' }));
    //     const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => ({ type: 'errorResponse' }));
    //     const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
    //     const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
    //     const command: { type: 'command' } = { type: 'command' };
    //     const command2: { type: 'command2' } = { type: 'command2' };
    //     const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
    //     const errorCommand2: { type: 'errorCommand2' } = { type: 'errorCommand2' };
    //     const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => from([command2, command2, command2, command2]));
    //     const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => (errorCommand));
    //     const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => (errorCommand2));
    //     const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => (errorResponse2));
    //     const mapResponseSpy = jest.fn<{ type: 'response2' }[], [any]>((response: any) => (response));
    //     let count = 0;
    //     let countError = 0;
    //     const downstream = saga.pipe(bufferLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
    //     downstream.toObservable().subscribe({
    //         next(value) {
    //             count += 1;
    //             expect(value).toHaveLength(4)
    //             for (const item of value) {
    //                 expect(item.type).toBeDefined();
    //                 expect(item.type).toEqual('response2');
    //             }
    //         },
    //         complete() {
    //             expect(count).toEqual(2);
    //             expect(execMock).toHaveBeenCalledTimes(8);
    //             expect(execMock).toHaveBeenNthCalledWith(1, command);
    //             expect(execMock).toHaveBeenNthCalledWith(2, [command2, command2, command2, command2]);
    //             expect(execMock).toHaveBeenNthCalledWith(3, command);
    //             expect(execMock).toHaveBeenNthCalledWith(4, [command2, command2, command2, command2]);
    //             expect(execMock).toHaveBeenNthCalledWith(5, errorCommand2);
    //             expect(execMock).toHaveBeenNthCalledWith(6, errorCommand);
    //             expect(execMock).toHaveBeenNthCalledWith(7, command);
    //             expect(execMock).toHaveBeenNthCalledWith(8, [command2, command2, command2, command2]);
    //             done();
    //         },
    //     });
    //     saga.toErrorObservable().subscribe({
    //         next(value) {
    //             countError += 1;
    //             expect(value.type).toBeDefined();
    //             expect(value.type).toEqual('errorResponse');
    //         },
    //         complete() {
    //             expect(countError).toEqual(1)
    //         },
    //     })
    //     saga.next(command);
    //     saga.next(command);
    //     saga.next(command);
    //     saga.complete();
    // });
    // it('should propagate unexpected errors from downstream to upstream', (done) => {
    //     const response: { type: 'response' } = { type: 'response' };
    //     const response2: { type: 'response2' } = { type: 'response2' };
    //     const errorResponse: {
    //         type: 'errorResponse'
    //     } = {
    //         type: 'errorResponse'
    //     };
    //     const errorResponse2: {
    //         type: 'errorResponse2'
    //     } = {
    //         type: 'errorResponse2'
    //     };
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return throwError(() => new ErrorMock());
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return throwError(() => new ErrorMock());
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return throwError(() => new ErrorMock());
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([errorResponse2]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([errorResponse]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([response]);
    //     });
    //     execMock.mockImplementationOnce(() => {
    //         return from([[response2, response2, response2, response2]]);
    //     });
    //     const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => ({ type: 'errorCommand' }));
    //     const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => ({ type: 'errorResponse' }));
    //     const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
    //     const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
    //     const command: { type: 'command' } = { type: 'command' };
    //     const command2: { type: 'command2' } = { type: 'command2' };
    //     const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
    //     const errorCommand2: { type: 'errorCommand2' } = { type: 'errorCommand2' };
    //     const error = new ErrorMock();
    //     const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => from([command2, command2, command2, command2]));
    //     const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => (errorCommand));
    //     const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => (errorCommand2));
    //     const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => (errorResponse2));
    //     const mapResponseSpy = jest.fn<{ type: 'response2' }[], [any]>((response: any) => (response));
    //     let count = 0;
    //     let countError = 0;
    //     let countUnexpectedError = 0;
    //     const downstream = saga.pipe(bufferLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
    //     downstream.toObservable().subscribe({
    //         next(value) {
    //             count += 1;
    //             expect(value).toHaveLength(4)
    //             for (const item of value) {
    //                 expect(item.type).toBeDefined();
    //                 expect(item.type).toEqual('response2');
    //             }
    //         },
    //         complete() {
    //             expect(count).toEqual(1);
    //             expect(execMock).toHaveBeenCalledTimes(9);
    //             expect(execMock).toHaveBeenNthCalledWith(1, command);
    //             expect(execMock).toHaveBeenNthCalledWith(2, [command2, command2, command2, command2]);
    //             expect(execMock).toHaveBeenNthCalledWith(3, errorCommand2);
    //             expect(execMock).toHaveBeenNthCalledWith(4, command);
    //             expect(execMock).toHaveBeenNthCalledWith(5, [command2, command2, command2, command2]);
    //             expect(execMock).toHaveBeenNthCalledWith(6, errorCommand2);
    //             expect(execMock).toHaveBeenNthCalledWith(7, errorCommand);
    //             expect(execMock).toHaveBeenNthCalledWith(8, command);
    //             expect(execMock).toHaveBeenNthCalledWith(9, [command2, command2, command2, command2]);
    //             done();
    //         },
    //     });
    //     saga.toErrorObservable().subscribe({
    //         next(value) {
    //             countError += 1;
    //             expect(value.type).toBeDefined();
    //             expect(value.type).toEqual('errorResponse');
    //         },
    //         complete() {
    //             expect(countError).toEqual(1)
    //         },
    //     });
    //     saga.toUnexpectedErrorObservable().subscribe({
    //         next(value) {
    //             countUnexpectedError += 1;
    //             expect(value).toBeInstanceOf(ErrorMock);
    //             expect(value).toEqual(error);
    //         },
    //         complete() {
    //             expect(countUnexpectedError).toEqual(1)
    //         },
    //     })
    //     saga.next(command);
    //     saga.next(command);
    //     saga.next(command);
    //     saga.complete();
    // });
    it('should catch mapped errors and treat them as unexpected errors, but keeping aggreagated downstream commands before proceeding them futher down', (done) => {
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
            return from([errorResponse2]);
        });
        execMock.mockImplementationOnce(() => {
            return from([errorResponse]);
        });
        execMock.mockImplementationOnce(() => {
            return from([response]);
        });
        execMock.mockImplementationOnce(() => {
            return from([[response2]]);
        });
        const mapErrorUpstreamSpy = jest.fn<{ type: 'errorCommand' }, [ErrorMock]>((error: ErrorMock) => ({ type: 'errorCommand' }));
        const mapErrorResponseUpstreamSpy = jest.fn<{ type: 'errorResponse' }, [any]>((errorResponse: any) => ({ type: 'errorResponse' }));
        const mapResponseUpstreamSpy = jest.fn<{ type: 'response' }, [any]>((response: any) => (response));
        const saga = new SagaSubject<{ type: 'command' }, { type: 'response' }, ErrorMock, { type: 'errorCommand' }, { type: 'errorResponse' }>(busMock(), mapErrorUpstreamSpy, mapResponseUpstreamSpy, mapErrorResponseUpstreamSpy);
        const command: { type: 'command' } = { type: 'command' };
        const command2: { type: 'command2' } = { type: 'command2' };
        const errorCommand: { type: 'errorCommand' } = { type: 'errorCommand' };
        const errorCommand2: { type: 'errorCommand2' } = { type: 'errorCommand2' };
        const error = new ErrorMock();
        let observableCount = 0
        const mapSpy = jest.fn<Observable<{ type: 'command2' }>, [{ type: 'response' }]>((upstream: { type: 'response' }) => {
            observableCount += 1;
            return observableCount === 3 ? from([command2, command2, command2, command2]).pipe(
            mergeMap((value, index ) => {
                return index % 2 === 1 ? throwError(() => new ErrorMock()) : from([value]);
            })
            ) : from([command2, command2, command2, command2]);
        });
        const liftErrorSpy = jest.fn<{ type: 'errorCommand' }, [{ type: 'errorResponse2' }]>((errorResponse: { type: 'errorResponse2' }) => (errorCommand));
        const mapErrorSpy = jest.fn<{ type: 'errorCommand2' }, [ErrorMock]>((error: ErrorMock) => (errorCommand2));
        const mapErrorResponseSpy = jest.fn<{ type: 'errorResponse2' }, [any]>((errorResponse: any) => (errorResponse2));
        const mapResponseSpy = jest.fn<{ type: 'response2' }[], [any]>((response: any) => (response));
        let count = 0;
        let countError = 0;
        let countUnexpectedError = 0;
        const downstream = saga.pipe(bufferLink(mapSpy, liftErrorSpy, mapErrorSpy, mapResponseSpy, mapErrorResponseSpy));
        downstream.toObservable().subscribe({
            next(value) {
                count += 1;
                expect(value).toHaveLength(1)
                for (const item of value) {
                    expect(item.type).toBeDefined();
                    expect(item.type).toEqual('response2');
                }
            },
            complete() {
                expect(count).toEqual(1);
                expect(execMock).toHaveBeenCalledTimes(9);
                expect(execMock).toHaveBeenNthCalledWith(1, command);
                expect(execMock).toHaveBeenNthCalledWith(2, [command2, command2, command2, command2]);
                expect(execMock).toHaveBeenNthCalledWith(3, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(4, command);
                expect(execMock).toHaveBeenNthCalledWith(5, [command2, command2, command2, command2]);
                expect(execMock).toHaveBeenNthCalledWith(6, errorCommand2);
                expect(execMock).toHaveBeenNthCalledWith(7, errorCommand);
                expect(execMock).toHaveBeenNthCalledWith(8, command);
                expect(execMock).toHaveBeenNthCalledWith(9, [command2]);
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
                expect(countError).toEqual(1)
            },
        });
        saga.toUnexpectedErrorObservable().subscribe({
            next(value) {
                countUnexpectedError += 1;
                expect(value).toBeInstanceOf(ErrorMock);
                expect(value).toEqual(error);
            },
            complete() {
                expect(countUnexpectedError).toEqual(2)
            },
        })
        saga.next(command);
        saga.next(command);
        saga.next(command);
        saga.complete();
    });
});