import { EMPTY, Observable, catchError, reduce } from "rxjs";
import { IError } from "../error/error.interface"
import SagaSubject from "../observable/saga-observable"
import { SagaOperatorFunction } from "./saga-operator-function";

const bufferLink = <C, R, E extends IError, C2, R2, Cbis, Rbis, Ebis extends IError, C2bis, R2bis>(
    map: (upstream: R) => Observable<Cbis>,
    liftError: (errorResponse: R2bis) => C2,
    mapError: (error: Ebis) => C2bis,
    mapResponse: (busResponse: any) => Rbis,
    mapErrorResponse: (busResponse: any) => R2bis,
): SagaOperatorFunction<C, R, E, C2, R2, Cbis[], Rbis, Ebis, C2bis, R2bis> => {
    return (saga: SagaSubject<C, R, E, C2, R2>) => {
        const downstream = saga.liftBus(SagaSubject<Cbis[], Rbis, Ebis, C2bis, R2bis>)(mapError, mapResponse, mapErrorResponse);
        saga.toObservable()
        .subscribe({
            next(value: R) {
                map(value).pipe(
                    catchError((err, caught) => {
                        saga.unexpectedError(err);
                        return EMPTY;
                    }),
                    reduce((acc, curr) => (acc.push(curr), acc), [] as Cbis[]),
                ).subscribe({
                    next(innerValue) {
                        downstream.next(innerValue);
                    },
                })
            },
            complete() {
                downstream.complete();
            },
        });
        downstream.toErrorObservable().subscribe({
            next(value: R2bis) {
                saga.error(liftError(value))
            },
            complete() {
                saga.complete();
            },
        })
        downstream.toUnexpectedErrorObservable().subscribe({
            next(value) {
                saga.unexpectedError(value);
            },
            complete() {
                saga.complete()
            },
        })
        return downstream;
    };
}

export default bufferLink