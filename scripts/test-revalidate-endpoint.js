/**
 * CH-026: exercises /api/revalidate against synthetic signed payloads.
 *
 *   node scripts/test-revalidate-endpoint.js
 *   node scripts/test-revalidate-endpoint.js https://www.curatehealth.ca
 *
 * Needs SANITY_REVALIDATE_SECRET in the environment, matching whatever the
 * target is running with. Defaults to http://localhost:3000.
 *
 * Signatures are produced with @sanity/webhook's own encodeSignatureHeader,
 * the same code path Sanity signs with, so a pass here means the endpoint
 * agrees with the real sender rather than merely agreeing with this script.
 *
 * Two properties of the signature scheme worth knowing, both confirmed by
 * reading the package rather than assumed:
 *
 *   - the timestamp is milliseconds, and must be at or after 2021-01-01
 *   - there is no expiry window. Verification re-encodes using the timestamp
 *     carried in the header, so an old but correctly signed delivery stays
 *     valid indefinitely. That is a replay window. It is acceptable here
 *     because a replayed delivery just purges a cache that did not need
 *     purging. Do not describe this endpoint as rejecting stale deliveries.
 */

const {
  SIGNATURE_HEADER_NAME,
  encodeSignatureHeader,
} = require("@sanity/webhook");

const BASE =
  process.argv[2] || process.env.REVALIDATE_TEST_BASE || "http://localhost:3000";
const ENDPOINT = `${BASE.replace(/\/$/, "")}/api/revalidate`;
const SECRET = process.env.SANITY_REVALIDATE_SECRET;

/** A realistic Sanity delivery body. Signed and sent as one exact string. */
const BODY = JSON.stringify({
  _id: "ba90a190-6e64-4230-b483-7134689d667d",
  _type: "contactPage",
  _rev: "Ryfm3zd62onQjpcVGEa7Om",
});

const RULE = "=".repeat(78);
const results = [];

async function post(label, { body = BODY, signature, expect }) {
  const headers = { "Content-Type": "application/json" };
  if (signature !== undefined) headers[SIGNATURE_HEADER_NAME] = signature;

  let status = 0;
  let payload = null;

  try {
    const response = await fetch(ENDPOINT, { method: "POST", headers, body });
    status = response.status;
    payload = await response.json().catch(() => null);
  } catch (error) {
    results.push({ label, expect, status: `ERR ${error.message}`, pass: false });
    return;
  }

  results.push({
    label,
    expect,
    status,
    revalidated: payload ? String(payload.revalidated) : "-",
    pass: status === expect,
  });
}

async function main() {
  if (!SECRET) {
    console.error(
      "SANITY_REVALIDATE_SECRET is not set. Export it, matching the value the " +
        "target server is running with."
    );
    process.exit(2);
  }

  console.log(RULE);
  console.log(`CH-026 revalidation endpoint check`);
  console.log(`target: ${ENDPOINT}`);
  console.log(RULE);

  const now = Date.now();

  // 1. The happy path. This is the only case that should purge.
  await post("valid signature", {
    signature: await encodeSignatureHeader(BODY, now, SECRET),
    expect: 200,
  });

  // 2. An unsigned POST. The rule is that this can never be accepted.
  await post("no signature header", { signature: undefined, expect: 401 });

  // 3. Header present but not parseable as t=<ms>,v1=<hash>.
  await post("malformed signature header", {
    signature: "not-a-signature",
    expect: 401,
  });

  // 4. Correctly shaped, but the timestamp predates the allowed minimum.
  await post("timestamp below minimum", {
    signature: "t=1,v1=Zm9vYmFy",
    expect: 401,
  });

  // 5. Correctly signed, wrong secret. Catches a mismatched env var.
  await post("signed with the wrong secret", {
    signature: await encodeSignatureHeader(BODY, now, `${SECRET}-wrong`),
    expect: 401,
  });

  // 6. Valid signature, body swapped underneath it. Catches a verifier that
  //    checks the header in isolation, or one that re-encodes the JSON before
  //    hashing rather than using the raw bytes.
  await post("body tampered after signing", {
    signature: await encodeSignatureHeader(BODY, now, SECRET),
    body: JSON.stringify({ _id: "tampered", _type: "post" }),
    expect: 401,
  });

  // 7. GET is not a delivery method, but should show the route is deployed.
  try {
    const response = await fetch(ENDPOINT, { method: "GET" });
    results.push({
      label: "GET returns 405",
      expect: 405,
      status: response.status,
      revalidated: "-",
      pass: response.status === 405,
    });
  } catch (error) {
    results.push({
      label: "GET returns 405",
      expect: 405,
      status: `ERR ${error.message}`,
      pass: false,
    });
  }

  const width = Math.max(...results.map((r) => r.label.length));

  console.log("");
  for (const r of results) {
    console.log(
      `  ${r.pass ? "PASS" : "FAIL"}  ${r.label.padEnd(width)}  ` +
        `want ${String(r.expect).padEnd(3)} got ${String(r.status).padEnd(3)}` +
        `  revalidated=${r.revalidated ?? "-"}`
    );
  }

  const failed = results.filter((r) => !r.pass);

  console.log(`\n${RULE}`);
  if (failed.length) {
    console.log(`FAIL: ${failed.length} of ${results.length} checks failed.`);
    console.log(RULE);
    process.exit(1);
  }

  console.log(`PASS: all ${results.length} checks passed.`);
  console.log("Exactly one delivery was accepted, the correctly signed one.");
  console.log(RULE);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
