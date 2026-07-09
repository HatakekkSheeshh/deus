import {
  generateAccessToken,
  hashAccessToken,
  normalizeAccessToken,
  verifyAccessTokenHash
} from "@/lib/server/access-token";

it("generates prefixed share tokens for family and counselor roles", () => {
  const familyToken = generateAccessToken("family");
  const counselorToken = generateAccessToken("counselor");

  expect(familyToken).toMatch(/^FAM-[A-Za-z0-9_-]{32}$/);
  expect(counselorToken).toMatch(/^COU-[A-Za-z0-9_-]{32}$/);
  expect(familyToken).not.toEqual(counselorToken);
});

it("normalizes tokens before hashing so copied tokens are stable", () => {
  const first = hashAccessToken(" fam-AbC_123 ", "test-pepper");
  const second = hashAccessToken("FAM-ABC_123", "test-pepper");

  expect(normalizeAccessToken(" fam-AbC_123 ")).toBe("FAM-ABC_123");
  expect(first).toEqual(second);
  expect(first).toMatch(/^[a-f0-9]{64}$/);
  expect(first).not.toContain("FAM-ABC_123");
});

it("verifies token hashes without exposing raw token comparison", () => {
  const storedHash = hashAccessToken("COU-test-token", "test-pepper");

  expect(verifyAccessTokenHash(" cou-test-token ", storedHash, "test-pepper")).toBe(true);
  expect(verifyAccessTokenHash("COU-other-token", storedHash, "test-pepper")).toBe(false);
  expect(verifyAccessTokenHash("COU-test-token", "not-a-valid-hash", "test-pepper")).toBe(false);
});
