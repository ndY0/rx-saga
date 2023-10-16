import { Observable } from "rxjs";

export default interface ICommandBus {
    exec<C, R>(command: C): Observable<R>;
}