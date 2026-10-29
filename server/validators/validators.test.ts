import test from "node:test";
import assert from "node:assert/strict";
import { inquirySchema, valuationSchema, subscriptionSchema, listingsQuerySchema, fieldErrors } from "./index.ts";

const goodInquiry = {
  fullName: "Ada Obi",
  email: "ADA@Example.com ",
  phone: "+234 803 000 7890",
  primaryInterest: "buy",
  preferredLocation: "Lekki Phase 1",
  estimatedBudget: "₦150M - ₦500M",
  messageDetails: "<b>Hello</b>",
  consent: true,
};

test("inquiry: valid data is accepted, sanitised and normalised", () => {
  const r = inquirySchema.safeParse(goodInquiry);
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.email, "ada@example.com");
    assert.equal(r.data.messageDetails, "Hello");
  }
});

test("inquiry: bad data yields per-field errors", () => {
  const r = inquirySchema.safeParse({ ...goodInquiry, fullName: "A", email: "nope", phone: "abc", consent: false });
  assert.equal(r.success, false);
  if (!r.success) {
    const f = fieldErrors(r.error.issues);
    assert.ok(f.fullName && f.email && f.phone && f.consent);
  }
});

test("valuation: minimal valid request defaults to discreet", () => {
  const r = valuationSchema.safeParse({
    fullName: "Ada Obi",
    email: "a@b.co",
    phone: "08030007890",
    propertyType: "Luxury Penthouse / Apartment",
    location: "Ikoyi",
  });
  assert.equal(r.success, true);
  if (r.success) assert.equal(r.data.saleStrategy, "discreet");
});

test("subscribe: lowercases and validates email", () => {
  assert.equal(subscriptionSchema.safeParse({ email: "x" }).success, false);
  const r = subscriptionSchema.safeParse({ email: " X@Y.com " });
  assert.equal(r.success && r.data.email, "x@y.com");
});

test("listings query: coerces prices and rejects junk", () => {
  const ok = listingsQuerySchema.safeParse({ minPrice: "50000000", q: " pool " });
  assert.equal(ok.success && ok.data.minPrice, 50000000);
  assert.equal(listingsQuerySchema.safeParse({ minPrice: "abc" }).success, false);
});
