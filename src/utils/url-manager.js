/**
 * URL and routing utilities
 */
class URLManager {
  constructor() {
    this.PERM_SEPARATOR = "+";
    this.PERM_ASSIGN = ".";
  }

  slugify(text = "") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  getDefaultStory(stories) {
    if (!stories.length) return null;

    const firstGroup = stories[0];
    const firstName = Object.keys(firstGroup.stories)[0];

    return {
      groupIndex: 0,
      name: firstName,
      args: { ...(firstGroup.meta?.args || {}) },
      slots: { ...(firstGroup.meta?.slots || {}) },
    };
  }

  findStoryBySlugs(stories, componentSlug, storySlug) {
    if (!stories.length || !componentSlug || !storySlug) return null;

    for (let gi = 0; gi < stories.length; gi++) {
      const group = stories[gi];
      const groupSlug = this.slugify(group.meta.title);
      if (groupSlug !== componentSlug) continue;

      const storyNames = Object.keys(group.stories);
      for (const name of storyNames) {
        if (this.slugify(name) === storySlug) {
          return { groupIndex: gi, name };
        }
      }
    }

    return null;
  }

  parseArgs(searchParams) {
    return this.parseStorySearchParams(searchParams).args;
  }

  parseStorySearchParams(searchParams) {
    const params =
      typeof searchParams === "string"
        ? new URLSearchParams(searchParams)
        : searchParams || new URLSearchParams();

    const result = {};
    let permutation = null;
    for (const [key, value] of params.entries()) {
      if (key === "perm") {
        permutation = this.parsePermutationParam(value);
        continue;
      }
      if (key === "auto") continue;
      result[key] = this._coerceValue(value);
    }
    return { args: result, permutation };
  }

  buildStoryPath(stories, groupIndex, storyName) {
    const group = stories[groupIndex];
    if (!group) return "/";
    const componentSlug = this.slugify(group.meta.title);
    const storySlug = this.slugify(storyName);
    return `/components/${componentSlug}/${storySlug}`;
  }

  buildStoryURL(stories, groupIndex, storyName, args = {}, options = {}) {
    const path = this.buildStoryPath(stories, groupIndex, storyName);
    const params = new URLSearchParams();

    Object.entries(args || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    if (options?.permutation) {
      const encoded = this.serializePermutation(options.permutation);
      if (encoded) {
        params.set("perm", encoded);
        params.set("auto", "1");
      }
    }

    const search = params.toString();
    return search ? `${path}?${search}` : path;
  }

  buildDocsPath(section, slug) {
    if (!section || !slug) return "/docs";
    return `/docs/${section}/${slug}`;
  }

  buildTokensPath(tokenId) {
    return tokenId ? `/tokens/${tokenId}` : "/tokens";
  }

  buildIconsPath(iconId) {
    return iconId ? `/icons/${iconId}` : "/icons";
  }

  serializePermutation(selection = {}) {
    const entries = Object.entries(selection || {}).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    );
    if (!entries.length) return "";
    return entries
      .map(
        ([axis, value]) =>
          `${encodeURIComponent(axis)}${this.PERM_ASSIGN}${encodeURIComponent(value)}`
      )
      .join(this.PERM_SEPARATOR);
  }

  parsePermutationParam(raw = "") {
    if (!raw) return null;
    const selection = {};
    raw
      .split(this.PERM_SEPARATOR)
      .filter(Boolean)
      .forEach((pair) => {
        const [axisPart, valuePart] = pair.split(this.PERM_ASSIGN);
        if (!axisPart || !valuePart) return;
        const axis = decodeURIComponent(axisPart);
        const value = decodeURIComponent(valuePart);
        if (axis) {
          selection[axis] = value;
        }
      });
    return Object.keys(selection).length ? selection : null;
  }

  _coerceValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!Number.isNaN(Number(value)) && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }
}

// Create and export singleton instance
const urlManager = new URLManager();

// Export methods
export const slugify = (text) => urlManager.slugify(text);
export const getDefaultStory = (stories) => urlManager.getDefaultStory(stories);
export const findStoryBySlugs = (stories, componentSlug, storySlug) =>
  urlManager.findStoryBySlugs(stories, componentSlug, storySlug);
export const parseArgsFromSearch = (searchParams) => urlManager.parseArgs(searchParams);
export const parseStorySearchParams = (searchParams) =>
  urlManager.parseStorySearchParams(searchParams);
export const buildStoryPath = (stories, groupIndex, storyName) =>
  urlManager.buildStoryPath(stories, groupIndex, storyName);
export const buildStoryURL = (stories, groupIndex, storyName, args, options) =>
  urlManager.buildStoryURL(stories, groupIndex, storyName, args, options);
export const buildDocsPath = (section, slug) => urlManager.buildDocsPath(section, slug);
export const buildTokensPath = (tokenId) => urlManager.buildTokensPath(tokenId);
export const buildIconsPath = (iconId) => urlManager.buildIconsPath(iconId);
export const serializePermutation = (selection) => urlManager.serializePermutation(selection);
export const parsePermutationParam = (value) => urlManager.parsePermutationParam(value);
