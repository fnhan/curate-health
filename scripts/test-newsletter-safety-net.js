/**
 * Prove a refused newsletter signup is caught rather than lost.
 *
 *   node scripts/test-newsletter-safety-net.js [target]
 *
 * It tests against the REAL Systeme.io endpoint, not a stand-in, by sending
 * an address Systeme.io refuses but the route accepts: "a@b" has an @ so it
 * passes the route's own check, and no usable domain so Systeme.io hands the
 * subscribe form back. That exercises the genuine refusal path end to end.
 *
 * Run the target with NEWSLETTER_FALLBACK_ENDPOINT pointed at the catcher
 * this script starts:
 *
 *   NEWSLETTER_FALLBACK_ENDPOINT=http://localhost:8892/catch npm start
 *
 * Nothing is ever added to the Systeme.io list by this, because every
 * address it sends is one Systeme.io refuses.
 */
const http = require("http");

const TARGET = process.argv[2] || "http://localhost:3000";
const REFUSED_BY_SYSTEME = "a@b";

(async () => {
  const caught = [];
  const catcher = http.createServer((req, res) => {
    const c = [];
    req.on("data", (d) => c.push(d));
    req.on("end", () => {
      try {
        caught.push(JSON.parse(Buffer.concat(c).toString()));
      } catch {
        caught.push({ unparseable: true });
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"ok":true}');
    });
  });
  await new Promise((r) => catcher.listen(8892, r));

  let failures = 0;
  const check = (name, got, want) => {
    const ok = got === want;
    if (!ok) failures++;
    console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}: ${got}${ok ? "" : `  (want ${want})`}`);
  };

  console.log("A refused address:");
  const bad = await fetch(`${TARGET}/api/newsletter-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: REFUSED_BY_SYSTEME }),
  });
  await new Promise((r) => setTimeout(r, 500));
  check("the visitor is told it failed", bad.status, 502);
  check("the address was caught", caught.length, 1);
  check("and it is the right one", caught[0] && caught[0].email, REFUSED_BY_SYSTEME);

  console.log("\nA malformed address never reaches Systeme.io:");
  const malformed = await fetch(`${TARGET}/api/newsletter-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "no-at-sign" }),
  });
  check("rejected by the route itself", malformed.status, 400);

  catcher.close();
  console.log(failures ? "\nFAIL" : "\nPASS: a refused signup is caught, not lost.");
  process.exit(failures ? 1 : 0);
})();
