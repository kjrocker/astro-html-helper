import * as assert from "assert";
import { netlifyFormsRefactor } from "./netlify-form";

describe("Refactors forms for Netlify", () => {
  it("adds data-netlify attribute to form if missing", async () => {
    const input = `<form><input name="a" /></form>`;
    const output = await netlifyFormsRefactor(input);
    assert.ok(output.includes("data-netlify={true}"));
  });

  it("does not duplicate data-netlify attribute if already present", async () => {
    const input = `<form data-netlify={true}><input name="a" /></form>`;
    const output = await netlifyFormsRefactor(input);
    const matches = output.match(/data-netlify=\{true\}/g) || [];
    assert.strictEqual(matches.length, 1);
  });

  it("inserts recaptcha div before submit button", async () => {
    const input = `<form><button type="submit">Send</button></form>`;
    const output = await netlifyFormsRefactor(input);
    assert.ok(output.includes("data-netlify-recaptcha={true}"));
    assert.ok(
      output.indexOf("data-netlify-recaptcha={true}") <
        output.indexOf('type="submit"')
    );
  });

  it("does not insert recaptcha div if no submit button", async () => {
    const input = `<form><input type="text" /></form>`;
    const output = await netlifyFormsRefactor(input);
    assert.ok(!output.includes("data-netlify-recaptcha={true}"));
  });
});
