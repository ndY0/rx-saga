import { IError } from "../error/error.interface"
import SagaSubject from "../observable/saga-observable"

const link = <C, R, E extends IError, C2, R2, Cbis, Rbis, Ebis extends IError, C2bis, R2bis> (saga: SagaSubject<C, R, E, C2, R2>) => (map: (upstream: R) => Cbis, liftError: (errorResponse: R2bis) => C2, mapError: (error: Ebis) => C2bis) => {
        const downstream = saga.liftBus(SagaSubject<Cbis, Rbis, Ebis, C2bis, R2bis>)(mapError);
        saga.toObservable().subscribe({
            next(value: R) {
                downstream.next(map(value))
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

export default link