import { listTokenMetadata, getTokenMeta } from "./tokens.js";

export {
  listComponentMetadata,
  getComponentStoryMeta,
  getComponentMetadataByComponent,
} from "./components.js";
export { listDocsMetadata } from "./docs.js";
export { listIconMetadata } from "./icons.js";
export { listTokenMetadata, getTokenMeta };

// Provide a stable helper matching the historic API shape used by playroom
export const getTokenMetadata = () => listTokenMetadata();
