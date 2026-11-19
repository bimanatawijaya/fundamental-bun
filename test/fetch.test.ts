import {describe, it, expect} from "bun:test";

describe("WEB API", () => {
    it("Should support web api", async () => {
        const response = await fetch("https://example.com");
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
        expect(await response.text()).toContain("Example Domain");
    })
})