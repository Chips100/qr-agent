import { exampleTest } from "./example";

describe('example', () => {
    it('should add two numbers', () => {
        expect(exampleTest(2, 2)).toEqual(4);
    });
});