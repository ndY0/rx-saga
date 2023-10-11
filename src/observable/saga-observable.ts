import { Observable, Subject, catchError, mergeMap, mergeAll, from, share } from "rxjs";
import { IError } from "../error/error.interface";
import ICommandBus from "../bus/command.bus.interface";
import { SagaOperatorFunction } from "../operators/saga-operator-function";
import pipeFromArray from "../helpers/pipe-from-array";

export default class SagaSubject<C, R, E extends IError, C2, R2> {

  private internalSubject = new Subject<C>();
  private internalErrorSubject = new Subject<C2>();
  private internalUnexpectedErrorSubject = new Subject<any>();
  private internal: Observable<R>;
  private internalError: Observable<R2>;
  private internalUnexpectedError: Observable<any>;

  constructor(private readonly commandBus: ICommandBus, mapError: (error: E) => C2) {
    this.internal = this.internalSubject.pipe(
      mergeMap((command: C) => this.commandBus.exec<C, R>(command)),
      catchError((err: E, caught) => {
        this.internalErrorSubject.next(mapError(err));
        return caught;
      }),
      share()
    )
    this.internalError = this.internalErrorSubject.pipe(
      mergeMap((command: C2) => this.commandBus.exec<C2, R2>(command)),
      catchError((err: Error, caught) => {
        this.internalUnexpectedErrorSubject.next(err);
        return caught;
      }),
      share()
    )
    this.internalUnexpectedError = this.internalUnexpectedErrorSubject.pipe(share());
  }
  pipe(): SagaSubject<C, R, E, C2, R2>;
  pipe<Cbis, Rbis, Ebis extends IError, C2bis, R2bis>(op1: SagaOperatorFunction<C, R, E, C2, R2, Cbis, Rbis, Ebis, C2bis, R2bis>): SagaSubject<Cbis, Rbis, Ebis, C2bis, R2bis>;
  // pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
  // pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
  // pipe<A, B, C, D>(
  //   op1: OperatorFunction<T, A>,
  //   op2: OperatorFunction<A, B>,
  //   op3: OperatorFunction<B, C>,
  //   op4: OperatorFunction<C, D>
  // ): Observable<D>;
  // pipe<A, B, C, D, E>(
  //   op1: OperatorFunction<T, A>,
  //   op2: OperatorFunction<A, B>,
  //   op3: OperatorFunction<B, C>,
  //   op4: OperatorFunction<C, D>,
  //   op5: OperatorFunction<D, E>
  // ): Observable<E>;
  // pipe<A, B, C, D, E, F>(
  //   op1: OperatorFunction<T, A>,
  //   op2: OperatorFunction<A, B>,
  //   op3: OperatorFunction<B, C>,
  //   op4: OperatorFunction<C, D>,
  //   op5: OperatorFunction<D, E>,
  //   op6: OperatorFunction<E, F>
  // ): Observable<F>;
  // pipe<A, B, C, D, E, F, G>(
  //   op1: OperatorFunction<T, A>,
  //   op2: OperatorFunction<A, B>,
  //   op3: OperatorFunction<B, C>,
  //   op4: OperatorFunction<C, D>,
  //   op5: OperatorFunction<D, E>,
  //   op6: OperatorFunction<E, F>,
  //   op7: OperatorFunction<F, G>
  // ): Observable<G>;
  // pipe<A, B, C, D, E, F, G, H>(
  //   op1: OperatorFunction<T, A>,
  //   op2: OperatorFunction<A, B>,
  //   op3: OperatorFunction<B, C>,
  //   op4: OperatorFunction<C, D>,
  //   op5: OperatorFunction<D, E>,
  //   op6: OperatorFunction<E, F>,
  //   op7: OperatorFunction<F, G>,
  //   op8: OperatorFunction<G, H>
  // ): Observable<H>;
  // pipe<A, B, C, D, E, F, G, H, I>(
  //   op1: OperatorFunction<T, A>,
  //   op2: OperatorFunction<A, B>,
  //   op3: OperatorFunction<B, C>,
  //   op4: OperatorFunction<C, D>,
  //   op5: OperatorFunction<D, E>,
  //   op6: OperatorFunction<E, F>,
  //   op7: OperatorFunction<F, G>,
  //   op8: OperatorFunction<G, H>,
  //   op9: OperatorFunction<H, I>
  // ): Observable<I>;
  // pipe<A, B, C, D, E, F, G, H, I>(
  //   op1: OperatorFunction<T, A>,
  //   op2: OperatorFunction<A, B>,
  //   op3: OperatorFunction<B, C>,
  //   op4: OperatorFunction<C, D>,
  //   op5: OperatorFunction<D, E>,
  //   op6: OperatorFunction<E, F>,
  //   op7: OperatorFunction<F, G>,
  //   op8: OperatorFunction<G, H>,
  //   op9: OperatorFunction<H, I>,
  //   ...operations: OperatorFunction<any, any>[]
  // ): Observable<unknown>;
  pipe(...operations: SagaOperatorFunction<any, any, any, any, any, any, any, any, any, any>[]): SagaSubject<any, any, any, any, any> {
    return pipeFromArray(operations)(this);
  }
  next(command: C): void {
    this.internalSubject.next(command);
  }
  complete(): void {
    this.internalSubject.complete();
    this.internalErrorSubject.complete();
    this.internalUnexpectedErrorSubject.complete();
  }
  error(error: C2): void {
    this.internalErrorSubject.next(error);
  }
  unexpectedError(error: any): void {
    this.internalUnexpectedErrorSubject.next(error);
  }
  toObservable(): Observable<R> {
    return this.internal;
  }
  toErrorObservable(): Observable<R2> {
    return this.internalError;
  }
  toUnexpectedErrorObservable(): Observable<any> {
    return this.internalUnexpectedError;
  }
  liftBus<Cbis, Rbis, Ebis extends IError, C2bis, R2bis>(Saga: typeof SagaSubject<Cbis, Rbis, Ebis, C2bis, R2bis>) {
    return (constructorArgs: ConstructorParameters<typeof SagaSubject<Cbis, Rbis, Ebis, C2bis, R2bis>>[1]) => new Saga(this.commandBus, constructorArgs);
  }
}