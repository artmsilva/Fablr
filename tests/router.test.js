import assert from "node:assert/strict";
import test from "node:test";

// Lightweight URLPattern stub for Node until it ships natively here.
if (typeof globalThis.URLPattern === "undefined") {
  class SimpleURLPattern {
    constructor({ pathname }) {
      this.pathname = pathname;
      this.parts = pathname.split("/").filter(Boolean);
    }

    exec(url) {
      const rawPath = url.pathname || "/";
      const normalizedPath =
        rawPath === "/"
          ? "/"
          : rawPath.endsWith("/") && rawPath !== "/" ? rawPath.slice(0, -1) : rawPath;
      if (this.pathname === "/" && normalizedPath === "/") {
        return { pathname: { groups: {} } };
      }
      const incomingParts = normalizedPath.split("/").filter(Boolean);
      if (incomingParts.length !== this.parts.length) return null;
      const groups = {};
      for (let i = 0; i < this.parts.length; i++) {
        const part = this.parts[i];
        const value = incomingParts[i];
        if (part.startsWith(":")) {
          groups[part.slice(1)] = value;
        } else if (part !== value) {
          return null;
        }
      }
      return { pathname: { groups } };
    }
  }
  globalThis.URLPattern = SimpleURLPattern;
}

const { matchRoutePath } = await import("../src/router.js");

test("matches home route with and without trailing slash", () => {
  assert.equal(matchRoutePath("/").name, "home");
  assert.equal(matchRoutePath("").name, "home");
  assert.equal(matchRoutePath("/").params?.group, undefined);
});

test("matches component route with slugs", () => {
  const route = matchRoutePath("/components/button/primary");
  assert.equal(route.name, "component");
  assert.deepEqual(route.params, { group: "button", story: "primary" });
});

test("matches component route with trailing slash", () => {
  const route = matchRoutePath("/components/button/primary/");
  assert.equal(route.name, "component");
  assert.deepEqual(route.params, { group: "button", story: "primary" });
});

test("matches docs route", () => {
  const route = matchRoutePath("/docs/foundation/color");
  assert.equal(route.name, "docs");
  assert.deepEqual(route.params, { section: "foundation", slug: "color" });
});

test("matches playroom route", () => {
  assert.equal(matchRoutePath("/playroom").name, "playroom");
});

test("matches tokens route with optional category", () => {
  assert.equal(matchRoutePath("/tokens").name, "tokens");
  const withCategory = matchRoutePath("/tokens/primitives");
  assert.equal(withCategory.name, "tokens");
  assert.deepEqual(withCategory.params, { category: "primitives" });
});

test("matches icons route", () => {
  assert.equal(matchRoutePath("/icons").name, "icons");
  const iconDetail = matchRoutePath("/icons/arrow-left");
  assert.equal(iconDetail.name, "icons");
  assert.deepEqual(iconDetail.params, { iconId: "arrow-left" });
});

test("returns not-found for unknown paths", () => {
  assert.equal(matchRoutePath("/not-a-real-page").name, "not-found");
});
