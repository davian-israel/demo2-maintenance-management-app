import assert from "node:assert/strict";
import test from "node:test";
import { getSafeReturnPath } from "./safe-return-path";

test("getSafeReturnPath accepts same-origin relative paths", () => {
  assert.equal(getSafeReturnPath("/maintenance/check?sessionId=abc"), "/maintenance/check?sessionId=abc");
  assert.equal(getSafeReturnPath("/jobs"), "/jobs");
});

test("getSafeReturnPath rejects empty and external targets", () => {
  assert.equal(getSafeReturnPath(null), null);
  assert.equal(getSafeReturnPath(""), null);
  assert.equal(getSafeReturnPath("https://evil.com/x"), null);
  assert.equal(getSafeReturnPath("//evil.com/path"), null);
  assert.equal(getSafeReturnPath("relative-no-slash"), null);
});
