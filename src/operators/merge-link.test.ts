import { Observable, from } from "rxjs";
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
                    if(index === 0 || (index - 1) % 5 === 0) {
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
});