import * as assert from "assert";
import { pictureTransform } from "./picture-component";

describe("Refactors pictures for Astro", () => {
  it("replaces picture with Picture, carrying over src attribute", async () => {
    const input = `---\n---\n<picture><img src="test.jpg"/></picture>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Picture } from "astro:assets";`));
    assert.ok(output.includes(`<Picture src="test.jpg" />`));
  });

  it("carries over height and width attributes", async () => {
    const input = `---\n---\n<picture><img src="test.jpg" height="100" width="200"/></picture>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Picture } from "astro:assets";`));
    assert.ok(
      output.includes(`<Picture src="test.jpg" height={100} width={200} />`)
    );
  });

  it("does NOT carry over decoding or loading", async () => {
    const input = `---\n---\n<picture><img src="test.jpg" height="100" width="200" decoding="async" loading="lazy"/></picture>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Picture } from "astro:assets";`));
    assert.ok(
      output.includes(`<Picture src="test.jpg" height={100} width={200} />`)
    );
  });

  it("carries over CSS classes on the picture and the image in a very specific way, for compatability", async () => {
    const input = `---\n---\n<picture class="picture-class"><img class="img-class" src="test.jpg"/></picture>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Picture } from "astro:assets";`));
    // Attribute order is "src", then "added" attributes, then anything carried from the img component.
    assert.ok(
      output.includes(
        `<Picture src="test.jpg" class={"img-class"} pictureAttributes={{ class: "picture-class" }} />`
      )
    );
  });

  it("carries over alt text from img element", async () => {
    const input = `---\n---\n<picture><img src="test.jpg" alt="A descriptive alt text"/></picture>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Picture } from "astro:assets";`));
    assert.ok(
      output.includes(`<Picture src="test.jpg" alt="A descriptive alt text" />`)
    );
  });
});
