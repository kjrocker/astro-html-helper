import * as assert from "assert";
import { pictureTransform } from "./picture-component";

describe("Refactors pictures for Astro", () => {
  it("imports the Picture component with the correct newlines", async () => {
    const input = `---\n---\n<picture><img src="test.jpg"/></picture>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`\nimport { Picture } from "astro:assets";`));
    assert.ok(output.includes(`<Picture src="test.jpg" />`));
  });

  it("replaces picture with Picture, carrying over src attribute", async () => {
    const input = `---\n---\n<picture><img src="test.jpg"/></picture>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Picture } from "astro:assets";`));
    assert.ok(output.includes(`<Picture src="test.jpg" />`));
  });

  it("replaces picture with Picture in nested elements", async () => {
    const input = `---\n---\n<section><div><picture><img src="test.jpg"/></picture></div></section>`;
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

describe("Refactors images for Astro", () => {
  it("replaces img with Image, carrying over src attribute", async () => {
    const input = `---\n---\n<img src="test.jpg"/>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Image } from "astro:assets";`));
    assert.ok(output.includes(`<Image src="test.jpg" />`));
  });

  it("replaces img with Image when nested", async () => {
    const input = `---\n---\n<section><div><img src="test.jpg"/></div></section>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Image } from "astro:assets";`));
    assert.ok(output.includes(`<Image src="test.jpg" />`));
  });

  it("carries over height and width attributes as expressions", async () => {
    const input = `---\n---\n<img src="test.jpg" height="100" width="200"/>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Image } from "astro:assets";`));
    assert.ok(
      output.includes(`<Image src="test.jpg" height={100} width={200} />`)
    );
  });

  it("does NOT carry over decoding or loading attributes", async () => {
    const input = `---\n---\n<img src="test.jpg" height="100" width="200" decoding="async" loading="lazy"/>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Image } from "astro:assets";`));
    assert.ok(
      output.includes(`<Image src="test.jpg" height={100} width={200} />`)
    );
    assert.ok(!output.includes("decoding"));
    assert.ok(!output.includes("loading"));
  });

  it("carries over CSS classes as expressions", async () => {
    const input = `---\n---\n<img class="img-class" src="test.jpg" height="100" width="200"/>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Image } from "astro:assets";`));
    assert.ok(
      output.includes(
        `<Image src="test.jpg" class={"img-class"} height={100} width={200} />`
      )
    );
  });

  it("carries over alt text and other string attributes", async () => {
    const input = `---\n---\n<img src="test.jpg" alt="A test image" title="Test title"/>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Image } from "astro:assets";`));
    assert.ok(output.includes(`alt="A test image"`));
    assert.ok(output.includes(`title="Test title"`));
  });

  it("handles mixed numeric and string attributes correctly", async () => {
    const input = `---\n---\n<img src="test.jpg" width="300" alt="Test" data-id="123"/>`;
    const output = await pictureTransform(input);
    assert.ok(output.includes(`import { Image } from "astro:assets";`));
    assert.ok(
      output.includes(
        `<Image src="test.jpg" width={300} alt="Test" data-id="123" />`
      )
    );
  });
});
