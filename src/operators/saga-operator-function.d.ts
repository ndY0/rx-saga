import { SagaSubject } from "../observable/saga-observable"

interface UnaryFunction<T, R> {
    (source: T): R;
}
export interface SagaOperatorFunction<C, R, E extends IError, C2, R2, Cbis, Rbis, Ebis extends IError, C2bis, R2bis> extends UnaryFunction<SagaSubject<C, R, E, C2, R2>, SagaSubject<Cbis, Rbis, Ebis, C2bis, R2bis>> { }
