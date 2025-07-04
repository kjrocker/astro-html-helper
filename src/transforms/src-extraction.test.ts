import * as assert from "assert";
import { sourceExtractionTransform } from "./src-extraction";

describe("Extracts source strings to frontmatter variables", () => {
  it("replaces Picture component with variable", async () => {
    const input = `---\n---\n<Picture src="https://example.com/test.jpg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const test = "https://example.com/test.jpg";`));
    assert.ok(output.includes(`<Picture src={test} />`));
  });

  it("replaces Image component with variable", async () => {
    const input = `---\n---\n<Image src="https://example.com/photo.png" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(
      output.includes(`const photo = "https://example.com/photo.png";`)
    );
    assert.ok(output.includes(`<Image src={photo} />`));
  });

  it("replaces img element with variable", async () => {
    const input = `---\n---\n<img src="https://example.com/image.webp" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(
      output.includes(`const image = "https://example.com/image.webp";`)
    );
    assert.ok(output.includes(`<img src={image} />`));
  });

  it("replaces picture element with variable", async () => {
    const input = `---\n---\n<picture><source src="https://example.com/banner.avif" /></picture>`;
    const output = await sourceExtractionTransform(input);

    assert.ok(
      output.includes(`const banner = "https://example.com/banner.avif";`)
    );
    assert.ok(output.includes(`<source src={banner} />`));
  });

  it("handles Picture with additional attributes", async () => {
    const input = `---\n---\n<Picture src="https://example.com/hero.jpg" alt="Hero image" width="800" height="600" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const hero = "https://example.com/hero.jpg";`));
    assert.ok(
      output.includes(
        `<Picture src={hero} alt="Hero image" width="800" height="600" />`
      )
    );
  });

  it("handles img with additional attributes", async () => {
    const input = `---\n---\n<img src="https://example.com/logo.svg" alt="Company logo" class="logo" loading="lazy" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const logo = "https://example.com/logo.svg";`));
    assert.ok(
      output.includes(
        `<img src={logo} alt="Company logo" class="logo" loading="lazy" />`
      )
    );
  });

  it("handles multiple images with different variable names", async () => {
    const input = `---\n---\n<Picture src="https://example.com/header.jpg" />\n<Image src="https://example.com/footer.png" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(
      output.includes(`const header = "https://example.com/header.jpg";`)
    );
    assert.ok(
      output.includes(`const footer = "https://example.com/footer.png";`)
    );
    assert.ok(output.includes(`<Picture src={header} />`));
    assert.ok(output.includes(`<Image src={footer} />`));
  });

  it("handles complex filename with multiple dots", async () => {
    const input = `---\n---\n<Image src="https://example.com/image.thumbnail.webp" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(
      output.includes(
        `const image = "https://example.com/image.thumbnail.webp";`
      )
    );
    assert.ok(output.includes(`<Image src={image} />`));
  });

  it("handles image with no file extension", async () => {
    const input = `---\n---\n<Picture src="https://example.com/avatar" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const avatar = "https://example.com/avatar";`));
    assert.ok(output.includes(`<Picture src={avatar} />`));
  });

  it("handles nested picture element with img child", async () => {
    const input = `---\n---\n<picture><img src="https://example.com/responsive.jpg" alt="Responsive image" /></picture>`;
    const output = await sourceExtractionTransform(input);

    assert.ok(
      output.includes(
        `const responsive = "https://example.com/responsive.jpg";`
      )
    );
    assert.ok(
      output.includes(`<img src={responsive} alt="Responsive image" />`)
    );
  });

  it("handles source element", async () => {
    const input = `---\n---\n<source src="https://example.com/test.avif" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const test = "https://example.com/test.avif";`));
    assert.ok(output.includes(`<source src={test} />`));
  });
});
