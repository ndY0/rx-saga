import pipeFromArray, { identity } from "./pipe-from-array"

describe('pipeFromArray', () => {
    it('should return the identity function if no operator is provided', () => {
        expect(pipeFromArray([])).toEqual(identity);
    })
    it('should return the given function if only one is provided', () => {
        const oneSpy = jest.fn((arg) => arg);
        const returned = pipeFromArray([oneSpy]);
        const value = returned('test');
        expect(oneSpy).toHaveBeenCalledTimes(1);
        expect(oneSpy).toHaveBeenNthCalledWith(1, 'test');
        expect(value).toEqual('test');
    })
    it('should return a function that recursively call all the given functions if more than one is provided', () => {
        const oneSpy = jest.fn((arg) => arg);
        const twoSpy = jest.fn((arg) => arg);
        const threeSpy = jest.fn((arg) => arg);
        const returned = pipeFromArray([oneSpy, twoSpy, threeSpy]);
        const value = returned('test');
        expect(oneSpy).toHaveBeenCalledTimes(1);
        expect(oneSpy).toHaveBeenNthCalledWith(1, 'test');
        expect(twoSpy).toHaveBeenCalledTimes(1);
        expect(twoSpy).toHaveBeenNthCalledWith(1, 'test');
        expect(threeSpy).toHaveBeenCalledTimes(1);
        expect(threeSpy).toHaveBeenNthCalledWith(1, 'test');
        expect(value).toEqual('test');
    })
    it('should as identity function return it\'s provided argument', () => {
        const test = {test: 'test'};
        const value = identity(test);
        expect(value).toEqual(test);
    })
})