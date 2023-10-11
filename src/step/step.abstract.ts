import { IError } from "../error/error.interface";

export class Step<C,R, E extends IError> {
    constructor(command: C, returned: R, ...errors: E[]) {
        this.errors = errors;
        this.command = command;
        this.returned = returned;
    }
    public get errors() : E[] {
        return this.errors
    }
    private set errors(errors : E[]) {
        this.errors = errors;
    }
    public get command() : E[] {
        return this.errors
    }
    private set command(command : C) {
        this.command = command;
    }
    public get returned() : E[] {
        return this.errors
    }
    private set returned(returned : R) {
        this.returned = returned;
    }
}