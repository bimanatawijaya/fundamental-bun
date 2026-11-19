import {describe, it, expect} from 'bun:test'
import { sayHello } from '../src/hello'

describe("Hello", () => {
    it("Should support unit test", () => {
        const hello = sayHello('Bima');
        console.info(hello);

        expect(hello).toBe("Hello Bima");
    })
})