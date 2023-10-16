type ConstructorArgsExceptFirst<F> = 
   F extends { new (arg0: any, ...rest: infer R): any} ? R : never;

export type {ConstructorArgsExceptFirst}