import * as assert from "assert";
import { addImageToFrontmatter, addPictureToFrontmatter } from "./import-lexer";

describe("add picture/image imports to a code string", () => {
  it("adds Picture import if missing", async () => {
    const input = ``;
    const output = await addPictureToFrontmatter(input);
    assert.ok(output.includes('import { Picture } from "astro:assets";'));
  });

  it("adds Picture import to existing astro:assets import", async () => {
    const input = `import { Image } from "astro:assets";`;
    const output = await addPictureToFrontmatter(input);
    assert.equal(output, 'import { Image, Picture } from "astro:assets";');
  });

  it("adds Image import if missing", async () => {
    const input = ``;
    const output = await addImageToFrontmatter(input);
    assert.ok(output.includes('import { Image } from "astro:assets";'));
  });

  it("adds Image import to existing astro:assets import", async () => {
    const input = `import { Picture } from "astro:assets";`;
    const output = await addImageToFrontmatter(input);
    assert.equal(output, 'import { Picture, Image } from "astro:assets";');
  });
});
