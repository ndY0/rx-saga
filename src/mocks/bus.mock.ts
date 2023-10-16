import { Observable, from } from "rxjs";

const execMock = jest.fn<Observable<any>, any[]>(() => {
    return from([]);
})

const busMock = jest.fn(() => {
    return {
        exec: execMock,
    };
});

export { busMock, execMock }