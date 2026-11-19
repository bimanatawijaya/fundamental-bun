import {describe, it, expect} from 'bun:test'
import { User } from '../packages/user/user'; // dengan workspace

describe("Workspaces", () => {
    it("Should support unit test", () => {
        const user = new User('Bima');
        console.info(user.name);

        expect(user.name).toBe("Bima");
    })
})