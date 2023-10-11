import { SagaSubject } from "../observable/saga-observable"

export type SagaOperatorFunction<C, R, E extends IError, C2, R2, Cbis, Rbis, Ebis extends IError, C2bis, R2bis> = (saga: SagaSubject<C, R, E, C2, R2>) => SagaSubject<Cbis, Rbis, Ebis, C2bis, R2bis>
