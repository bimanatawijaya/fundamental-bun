// bun masih bisa beberapa menggunakan node api (library dari nodejs)

import {describe, it, expect} from 'bun:test'
import * as os from "node:os"

describe("NodeJS API", () =>  {
    it("Should support Os", () => {
        const arch = os.arch();
        console.info(arch);
        expect(arch).toBe("x64");

        const type = os.type();
        console.info(type);
        expect(type).toBe("Linux");
    })
})