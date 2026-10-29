import test from "node:test";
import assert from "node:assert/strict";
import { cleanText, safeFilename } from "./sanitize.ts";

test("cleanText strips tags and control characters", () => {
  assert.equal(cleanText("  <b>Ada</b>  Obi\u0000 "), "Ada Obi");
  assert.equal(cleanText("<script>alert(1)</script>Hello"), "alert(1)Hello");
});

test("safeFilename blocks path traversal and odd characters", () => {
  assert.equal(safeFilename("../../etc/passwd"), "passwd");
  assert.equal(safeFilename("C:\\docs\\title deed (1).pdf"), "title_deed_1_.pdf");
  assert.equal(safeFilename(".hidden"), "hidden");
});
