import { netlifyFormsTransform } from "../transforms/netlify-form";
import { pictureTransform } from "../transforms/picture-component";
import { sourceExtractionTransform } from "../transforms/src-extraction";
import { EditorChain } from "../utils/editor-chain";

export interface FormatOptions {
  netlifyForm: boolean;
  pictures: boolean;
  pictureSrcString: boolean;
  imageDir?: string;
}

export async function transformAstroFile(
  filePath: string,
  formatOptions: FormatOptions = {
    netlifyForm: false,
    pictures: true,
    pictureSrcString: true,
  }
): Promise<string> {
  try {
    const chain = (await EditorChain.init(filePath))
      .chain((text) =>
        formatOptions.netlifyForm ? netlifyFormsTransform(text) : text
      )
      .chain((text) => (formatOptions.pictures ? pictureTransform(text) : text))
      .chain((text) =>
        formatOptions.pictureSrcString ? sourceExtractionTransform(text, formatOptions.imageDir, filePath) : text
      );

    return await chain.write();
  } catch (error) {
    console.error(`❌ Error formatting file: ${error}`);
    return "";
  }
}
