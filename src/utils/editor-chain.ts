import { readFile, writeFile } from "fs/promises";

export class EditorChain {
  private path: string;
  private promise: Promise<string>;

  private constructor(path: string, content: string) {
    this.path = path;
    this.promise = Promise.resolve(content);
  }

  static async init(path: string) {
    const content = await readFile(path, "utf-8");
    return new EditorChain(path, content);
  }

  chain(fn: (text: string) => string | Promise<string>) {
    this.promise = this.promise.then(fn);
    return this;
  }

  async write() {
    const replaced = await this.promise;
    writeFile(this.path, replaced);
  }
}
