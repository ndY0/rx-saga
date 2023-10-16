[![npm version](https://badge.fury.io/js/rx-saga.svg)](https://badge.fury.io/js/rx-saga)
# Rx-Saga

> This project aim to build upon rxjs reactive functionnal programming to provide a Orchestration-based saga approach to designing your services within a microservice architecture. the main goal is to enforce error handling of every command you dispatch, and to provide operators to articulate commands and error handling.


## Table of contents

- [Project Name](#project-name)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Serving the app](#serving-the-app)
    - [Running the tests](#running-the-tests)
  - [Contributing](#contributing)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

These instructions will instruct you how to integrate this library into your projects

## Installation

declare this repository as a dependency in your project :

```sh
$ npm install rx-saga
```

Or if you prefer using Yarn:

```sh
$ yarn add rx-saga
```

## Usage

### CommandBus

before anything, you will need an implementation of the bus interface in order to execute the commands, wich follows :

```typescript
import ICommandBus from 'rx-saga/bus';
import { Observable } from 'rxjs';

export default class MyBusImpl implements ICommandBus {
    exec<C, R>(command: C): Observable<R> {
        /**
         * implements underlaying bus here
         */
        throw new Error('Method not implemented.');
    }
}
```

### SagaSubject

SagaSubject is the main class that allows you to bind the behaviour of a command and it's error handling counterpart.
it allow the following behaviours :

```typescript
import SagaSubject from "rx-saga";
import { IError } from 'rx-saga/error';
import MyBusImpl from './bus'


class Command {
    type = 'do_something';
    data: any;
    constructor(data) {
        this.data = data;
    }
}

class CommandError implements IError {
    type: string = 'error_command';
    data: any;
    previous: IError<any> | undefined;
    constructor(data: any, previous?: IError) {
        this.data = data
        this.previous = previous;
    }

}

class RecoverCommandError implements IError {
    type: string = 'unrecoverable_error';
    data: any;
    previous: IError<any> | undefined;
    constructor(data: any, previous?: IError) {
        this.data = data
        this.previous = previous;
    }
}

class RecoverCommand1 {
    type = 'recover_from_do_something1';
    data: any;
    constructor(data: any) {
        this.data = data;
    }
}
class RecoverCommand2 {
    type = 'recover_from_do_something2';
    data: any;
    constructor(data: any) {
        this.data = data;
    }
}

/**
 * mapError is where you will implement all the error treatment from the bus,
 * and define wich command to process to recover from handled errors.
 * not that any thrown error in this function will be treated in the unexpected error pipeline.
 */
const mapError = (err: CommandError) => {
    if(err.data === 1) {
        return new RecoverCommand1(err.data);
    } else {
        return new RecoverCommand2(err.data);
    }
}

/**
 * this function allow you to apply modification to the output response of the bus
 * after it has processed your command.
 * not that any thrown error in this function will be treated in the unexpected error pipeline.
 */
const mapResponse = (busResponse: any) => busResponse as {data: any};
/**
 * this function allow you to apply modification to the output response of the bus
 * after it has processed your error command.
 * not that any thrown error in this function will be treated in the unexpected error pipeline.
 */
const mapErrorResponse = (busResponse: any) => busResponse as {errorData: any};

const saga = new SagaSubject<
    Command,
    {data: any},
    CommandError,
    RecoverCommand1 | RecoverCommand2,
    {errorData:any}
>(new MyBusImpl(), mapError, mapResponse, mapErrorResponse);

/**
 * toObservable() return an RxJs Observable wich output the responses of the bus, after it has processed your commands.
 * it eventually completes if saga.complete() is called
 */
const subscription = saga.toObservable().subscribe({
    next(value: {data: any}) {
        console.log(value)
    },
    complete() {
        subscription.unsubscribe();
    },
});

/**
 * toErrorObservable() return an RxJs Observable wich output the errors of the bus, and process the linked error command.
 * it eventually completes if saga.complete() is called
 */
const subscriptionError = saga.toErrorObservable().subscribe({
    next(value: {errorData: any}) {
        console.log(value)
    },
    complete() {
        subscriptionError.unsubscribe();
    },
});

/**
 * toUnexpectedErrorObservable() outputs any error that does ot come from the bus, or any error from the bus while it
 * handles error commands.
 * it eventually completes if saga.complete() is called
 */
const subscriptionUnexpectedError = saga.toUnexpectedErrorObservable().subscribe({
    next(value: any) {
        console.log(value)
    },
    complete() {
        subscriptionUnexpectedError.unsubscribe();
    },
});

/**
 * SagaSubject ressemble an RxJs Subject, and therefore accepts new values to process with it's next(value) function.
 */
saga.next(new Command(1));
saga.next(new Command(0));
saga.complete();
```

### operators

operators are the fundamental tools to chain, split and merge different commands together.

- [link](doc/operators/link.md)
- [mergeLink](doc/operators/merge-link.md)
- [bufferLink](doc/operators/buffer-link.md)

### Running the tests

clone this project, and simply run

```sh
$ npm run test
```

## Contributing

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:


## Authors

* **Andy Crépin** - *Initial work* - [AndyCrepin](https://github.com/ndy0)

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Andrea SonnY