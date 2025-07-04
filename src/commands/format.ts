import { netlifyFormsTransform } from "../transforms/netlify-form";
import { pictureTransform } from "../transforms/picture-component";
import { sourceExtractionTransform } from "../transforms/src-extraction";
import { EditorChain } from "../utils/editor-chain";

export async function formatHtml(filePath: string): Promise<string> {
  try {
    const chain = (await EditorChain.init(filePath))
      .chain((text) => netlifyFormsTransform(text))
      .chain((text) => pictureTransform(text))
      .chain((text) => sourceExtractionTransform(text));

    return await chain.write();
  } catch (error) {
    console.error(`❌ Error formatting file: ${error}`);
    return "";
  }
}
