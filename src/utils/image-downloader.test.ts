import { strict as assert } from "assert";
import { 
  isRemoteImageUrl, 
  urlToImportName, 
  getRelativeImportPath 
} from "./image-downloader";

describe("image-downloader utils", () => {
  describe("isRemoteImageUrl", () => {
    it("should identify remote HTTP URLs", () => {
      assert.equal(isRemoteImageUrl("http://example.com/image.jpg"), true);
      assert.equal(isRemoteImageUrl("https://example.com/image.png"), true);
    });

    it("should not identify local paths as remote", () => {
      assert.equal(isRemoteImageUrl("./images/local.jpg"), false);
      assert.equal(isRemoteImageUrl("/assets/image.png"), false);
      assert.equal(isRemoteImageUrl("images/test.jpg"), false);
    });

    it("should handle invalid URLs", () => {
      assert.equal(isRemoteImageUrl("not-a-url"), false);
      assert.equal(isRemoteImageUrl(""), false);
    });
  });

  describe("urlToImportName", () => {
    it("should convert URLs to valid import names", () => {
      assert.equal(urlToImportName("https://example.com/test-image.jpg"), "testImage");
      assert.equal(urlToImportName("https://example.com/hero_photo.png"), "heroPhoto");
      assert.equal(urlToImportName("https://example.com/simple.jpg"), "simple");
    });

    it("should handle URLs with no filename", () => {
      assert.equal(urlToImportName("https://example.com/"), "image");
      assert.equal(urlToImportName("https://example.com"), "image");
    });

    it("should handle numeric prefixes", () => {
      assert.equal(urlToImportName("https://example.com/123image.jpg"), "img123image");
    });

    it("should handle special characters", () => {
      assert.equal(urlToImportName("https://example.com/my@image$1.jpg"), "myimage1");
    });
  });

  describe("getRelativeImportPath", () => {
    it("should create relative import paths", () => {
      const result = getRelativeImportPath("/project/assets/image.jpg", "/project/src");
      assert.equal(result, "../assets/image.jpg");
    });

    it("should handle same directory", () => {
      const result = getRelativeImportPath("/project/src/image.jpg", "/project/src");
      assert.equal(result, "./image.jpg");
    });

    it("should handle subdirectories", () => {
      const result = getRelativeImportPath("/project/src/images/test.jpg", "/project/src");
      assert.equal(result, "./images/test.jpg");
    });
  });
});