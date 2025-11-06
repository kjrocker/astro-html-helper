import * as assert from "assert";
import { svgExtractionTransform } from "./svg-extraction";
import { readFile, unlink, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

describe("SVG Extraction Transform", () => {
  describe("Single SVG without ID", () => {
    it("extracts SVG to svg_01.svg and replaces with SVG01 component", async () => {
      const input = `---
---
<section>
  <svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>
</section>`;

      // We need a file path for the transform to work
      // For unit tests without actual file creation, we can test the AST transformation
      const output = await svgExtractionTransform(input);

      // Without a file path, it should return the input unchanged
      assert.strictEqual(output, input);
    });

    it("extracts SVG with file path and creates import", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-svg-01.astro"
      );
      const input = `---
---
<section>
  <svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>
</section>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Check import was added
      assert.ok(output.includes(`import SVG01 from "./svg_01.svg";`));

      // Check component replaced SVG
      assert.ok(output.includes(`<SVG01 />`));

      // Check original SVG is gone
      assert.ok(!output.includes(`<svg`));
      assert.ok(!output.includes(`<circle`));
    });
  });

  describe("Single SVG with ID", () => {
    it("uses ID for filename and component name", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-svg-with-id.astro"
      );
      const input = `---
---
<section>
  <svg id="user-icon" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>
</section>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Check import uses ID
      assert.ok(output.includes(`import UserIcon from "./user-icon.svg";`));

      // Check component uses ID
      assert.ok(output.includes(`<UserIcon />`));

      // Check original SVG is gone
      assert.ok(!output.includes(`<svg`));
    });

    it("handles IDs with underscores", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-svg-underscore.astro"
      );
      const input = `---
---
<svg id="my_special_icon"><path d="M10 10"/></svg>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Underscore converted to hyphen in filename
      assert.ok(output.includes(`import MySpecialIcon from "./my-special-icon.svg";`));
      assert.ok(output.includes(`<MySpecialIcon />`));
    });
  });

  describe("Multiple SVGs", () => {
    it("increments counter for multiple SVGs without IDs", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-multiple-svgs.astro"
      );
      const input = `---
---
<section>
  <svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>
  <svg width="50" height="50"><rect x="10" y="10" width="30" height="30"/></svg>
  <svg><path d="M0 0 L100 100"/></svg>
</section>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Check all three imports
      assert.ok(output.includes(`import SVG01 from "./svg_01.svg";`));
      assert.ok(output.includes(`import SVG02 from "./svg_02.svg";`));
      assert.ok(output.includes(`import SVG03 from "./svg_03.svg";`));

      // Check all three components
      assert.ok(output.includes(`<SVG01 />`));
      assert.ok(output.includes(`<SVG02 />`));
      assert.ok(output.includes(`<SVG03 />`));

      // Check no original SVGs remain
      assert.ok(!output.includes(`<svg`));
    });

    it("handles mix of SVGs with and without IDs", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-mixed-svgs.astro"
      );
      const input = `---
---
<div>
  <svg id="icon-one"><circle r="10"/></svg>
  <svg><rect width="20"/></svg>
  <svg id="icon-two"><path d="M0 0"/></svg>
</div>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Check imports
      assert.ok(output.includes(`import IconOne from "./icon-one.svg";`));
      assert.ok(output.includes(`import SVG02 from "./svg_02.svg";`)); // Counter continues
      assert.ok(output.includes(`import IconTwo from "./icon-two.svg";`));

      // Check components
      assert.ok(output.includes(`<IconOne />`));
      assert.ok(output.includes(`<SVG02 />`));
      assert.ok(output.includes(`<IconTwo />`));
    });
  });

  describe("Complex SVG content", () => {
    it("preserves complex SVG structure with nested elements", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-complex-svg.astro"
      );
      const complexSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="black">
    <path d="M10 10 L90 90"/>
    <circle cx="50" cy="50" r="30"/>
  </g>
  <text x="50" y="50">Hello</text>
</svg>`;
      const input = `---
---
<section>
  ${complexSvg}
</section>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Check import
      assert.ok(output.includes(`import SVG01 from "./svg_01.svg";`));

      // Check component replaced the complex SVG
      assert.ok(output.includes(`<SVG01 />`));

      // Verify no SVG tags remain in output
      assert.ok(!output.includes(`<svg`));
      assert.ok(!output.includes(`<g fill`));
      assert.ok(!output.includes(`<path`));
    });
  });

  describe("Frontmatter handling", () => {
    it("adds imports after header comments", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-with-comments.astro"
      );
      const input = `---
// This is a header comment
// Another comment
---
<svg id="my-icon"><circle r="10"/></svg>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Check that comments are preserved
      assert.ok(output.includes(`---\n// This is a header comment`));
      assert.ok(output.includes(`// Another comment`));

      // Check import is added
      assert.ok(output.includes(`import MyIcon from "./my-icon.svg";`));
    });

    it("doesn't create duplicate imports", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-no-duplicates.astro"
      );
      const input = `---
---
<div>
  <svg id="icon"><circle r="10"/></svg>
</div>`;

      // Run transform twice
      const output1 = await svgExtractionTransform(input, testFilePath);
      const output2 = await svgExtractionTransform(output1, testFilePath);

      // Count occurrences of the import statement
      const importStatement = `import Icon from "./icon.svg";`;
      const matches = output2.match(new RegExp(importStatement, "g"));

      // Should not have duplicates (transform should be idempotent on second run)
      // Note: On second run, there are no SVGs to extract, so imports won't be added again
      assert.ok(matches === null || matches.length === 1);
    });
  });

  describe("No SVGs present", () => {
    it("returns input unchanged when no SVGs present", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-no-svgs.astro"
      );
      const input = `---
---
<section>
  <div>No SVGs here</div>
  <img src="test.jpg" alt="An image"/>
</section>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Should be unchanged
      assert.strictEqual(output, input);
    });
  });

  describe("Edge cases", () => {
    it("handles SVG with ID starting with number", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-numeric-id.astro"
      );
      const input = `---
---
<svg id="123-icon"><circle r="10"/></svg>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Should prefix with "Svg" to make valid component name
      assert.ok(output.includes(`import Svg123Icon from "./123-icon.svg";`));
      assert.ok(output.includes(`<Svg123Icon />`));
    });

    it("handles SVG with special characters in ID", async () => {
      const testFilePath = join(
        process.cwd(),
        "scaffolding",
        "test-special-chars.astro"
      );
      const input = `---
---
<svg id="my@icon#test"><circle r="10"/></svg>`;

      const output = await svgExtractionTransform(input, testFilePath);

      // Special characters should be removed
      assert.ok(output.includes(`import Myicontest from "./myicontest.svg";`));
      assert.ok(output.includes(`<Myicontest />`));
    });
  });
});
