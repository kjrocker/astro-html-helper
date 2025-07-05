import * as assert from "assert";
import { sourceExtractionTransform } from "./src-extraction";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

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

  it("replaces Image component with variable", async () => {
    const input = `---\n---\n<Image src="https://example.com/test-photo.png" />`;
    const output = await sourceExtractionTransform(input);

    console.log("Output:", output);
    assert.ok(
      output.includes(`const testPhoto = "https://example.com/test-photo.png";`)
    );
    assert.ok(output.includes(`<Image src={testPhoto} />`));
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

  // Additional tests for filename patterns
  it("handles multiple hyphens in filename", async () => {
    const input = `---\n---\n<Image src="https://example.com/my-super-long-filename.jpg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const mySuperLongFilename = "https://example.com/my-super-long-filename.jpg";`));
    assert.ok(output.includes(`<Image src={mySuperLongFilename} />`));
  });

  it("handles underscores in filename", async () => {
    const input = `---\n---\n<Image src="https://example.com/user_profile_image.png" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const userProfileImage = "https://example.com/user_profile_image.png";`));
    assert.ok(output.includes(`<Image src={userProfileImage} />`));
  });

  it("handles mixed hyphens and underscores", async () => {
    const input = `---\n---\n<Image src="https://example.com/header-nav_logo.svg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const headerNavLogo = "https://example.com/header-nav_logo.svg";`));
    assert.ok(output.includes(`<Image src={headerNavLogo} />`));
  });

  it("handles numbers in filename", async () => {
    const input = `---\n---\n<Image src="https://example.com/image-2024-01.jpg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const image202401 = "https://example.com/image-2024-01.jpg";`));
    assert.ok(output.includes(`<Image src={image202401} />`));
  });

  it("handles filename starting with number", async () => {
    const input = `---\n---\n<Image src="https://example.com/01-hero-image.jpg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const img01HeroImage = "https://example.com/01-hero-image.jpg";`));
    assert.ok(output.includes(`<Image src={img01HeroImage} />`));
  });

  it("handles camelCase filename", async () => {
    const input = `---\n---\n<Image src="https://example.com/heroImage.jpg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const heroImage = "https://example.com/heroImage.jpg";`));
    assert.ok(output.includes(`<Image src={heroImage} />`));
  });

  it("handles single letter filename", async () => {
    const input = `---\n---\n<Image src="https://example.com/a.jpg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const a = "https://example.com/a.jpg";`));
    assert.ok(output.includes(`<Image src={a} />`));
  });

  it("handles uppercase letters in filename", async () => {
    const input = `---\n---\n<Image src="https://example.com/MY-LOGO.PNG" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const MYLOGO = "https://example.com/MY-LOGO.PNG";`));
    assert.ok(output.includes(`<Image src={MYLOGO} />`));
  });

  it("handles special characters (should be handled gracefully)", async () => {
    const input = `---\n---\n<Image src="https://example.com/image@2x.jpg" />`;
    const output = await sourceExtractionTransform(input);

    assert.ok(output.includes(`const image2x = "https://example.com/image@2x.jpg";`));
    assert.ok(output.includes(`<Image src={image2x} />`));
  });
});

describe("Image download and import functionality", () => {
  let tempDir: string;
  let testImageDir: string;
  
  // Mock fetch for testing
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    tempDir = join(tmpdir(), `astro-test-${Date.now()}`);
    testImageDir = join(tempDir, "images");
    mkdirSync(testImageDir, { recursive: true });
    
    // Mock fetch to return a simple image buffer
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    });
  });
  
  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    global.fetch = originalFetch;
  });

  it("creates import statements for downloaded remote images", async () => {
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should create import statement instead of variable
    assert.ok(output.includes(`import hero from "./images/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
    
    // Should not create variable declaration
    assert.ok(!output.includes(`const hero = "https://example.com/hero.jpg";`));
    
    // Should have downloaded the file
    assert.ok(existsSync(join(testImageDir, "hero.jpg")));
  });

  it("creates import statements for multiple remote images", async () => {
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />\n<Picture src="https://example.com/banner.png" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should create import statements for both images
    assert.ok(output.includes(`import hero from "./images/hero.jpg";`));
    assert.ok(output.includes(`import banner from "./images/banner.png";`));
    assert.ok(output.includes(`<Image src={hero} />`));
    assert.ok(output.includes(`<Picture src={banner} />`));
    
    // Should have downloaded both files
    assert.ok(existsSync(join(testImageDir, "hero.jpg")));
    assert.ok(existsSync(join(testImageDir, "banner.png")));
  });

  it("handles mixed remote and local images", async () => {
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />\n<Image src="./local-image.png" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Remote image should get import statement
    assert.ok(output.includes(`import hero from "./images/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
    
    // Local image should get variable declaration
    assert.ok(output.includes(`const localImage = "./local-image.png";`));
    assert.ok(output.includes(`<Image src={localImage} />`));
    
    // Only remote image should be downloaded
    assert.ok(existsSync(join(testImageDir, "hero.jpg")));
  });

  it("fallback to variable when download fails", async () => {
    // Mock fetch to fail
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should fallback to variable declaration
    assert.ok(output.includes(`const hero = "https://example.com/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
    
    // Should not create import statement
    assert.ok(!output.includes(`import hero from`));
    
    // Should not have downloaded the file
    assert.ok(!existsSync(join(testImageDir, "hero.jpg")));
  });

  it("handles relative import paths correctly", async () => {
    const subDir = join(tempDir, "src", "pages");
    mkdirSync(subDir, { recursive: true });
    const currentFilePath = join(subDir, "page.astro");
    
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />`;
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should create correct relative import path
    assert.ok(output.includes(`import hero from "../../images/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
  });

  it("handles duplicate image URLs by reusing existing files", async () => {
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />\n<Picture src="https://example.com/hero.jpg" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    // Pre-create the file to simulate existing download
    writeFileSync(join(testImageDir, "hero.jpg"), "existing content");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should create import statements for both usages
    assert.ok(output.includes(`import hero from "./images/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
    assert.ok(output.includes(`<Picture src={hero} />`));
    
    // Should only call fetch once (or not at all since file exists)
    expect(global.fetch).toHaveBeenCalledTimes(0);
  });

  it("handles images with query parameters", async () => {
    const input = `---\n---\n<Image src="https://example.com/hero.jpg?w=800&h=600" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should create import statement with clean filename
    assert.ok(output.includes(`import hero from "./images/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
    
    // Should have downloaded the file with clean name
    assert.ok(existsSync(join(testImageDir, "hero.jpg")));
  });

  it("handles images with complex paths", async () => {
    const input = `---\n---\n<Image src="https://cdn.example.com/assets/images/hero-image.jpg" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should create import statement with camelCase variable name
    assert.ok(output.includes(`import heroImage from "./images/hero-image.jpg";`));
    assert.ok(output.includes(`<Image src={heroImage} />`));
    
    // Should have downloaded the file
    assert.ok(existsSync(join(testImageDir, "hero-image.jpg")));
  });

  it("preserves existing frontmatter when adding imports", async () => {
    const input = `---\nconst title = "My Page";\nconst description = "A test page";\n---\n<Image src="https://example.com/hero.jpg" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Should preserve existing frontmatter
    assert.ok(output.includes(`const title = "My Page";`));
    assert.ok(output.includes(`const description = "A test page";`));
    
    // Should add import statement
    assert.ok(output.includes(`import hero from "./images/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
  });

  it("works without imageDir parameter (standard behavior)", async () => {
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />`;
    
    const output = await sourceExtractionTransform(input);
    
    // Should create variable declaration (standard behavior)
    assert.ok(output.includes(`const hero = "https://example.com/hero.jpg";`));
    assert.ok(output.includes(`<Image src={hero} />`));
    
    // Should not create import statement
    assert.ok(!output.includes(`import hero from`));
    
    // Should not call fetch
    expect(global.fetch).toHaveBeenCalledTimes(0);
  });

  it("only downloads images when imageDir is provided", async () => {
    const input = `---\n---\n<Image src="https://example.com/hero.jpg" />\n<Image src="./local.jpg" />`;
    const currentFilePath = join(tempDir, "page.astro");
    
    const output = await sourceExtractionTransform(input, testImageDir, currentFilePath);
    
    // Remote image should be downloaded and imported
    assert.ok(output.includes(`import hero from "./images/hero.jpg";`));
    
    // Local image should use variable (not remote)
    assert.ok(output.includes(`const local = "./local.jpg";`));
    
    // Should only call fetch for remote image
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
