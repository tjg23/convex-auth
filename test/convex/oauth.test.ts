import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import {
  CONVEX_SITE_URL,
  JWKS,
  JWT_PRIVATE_KEY,
  signInViaGitHub,
} from "./test.helpers";

test("sign up and sign in with oauth", async () => {
  setupEnv();
  const t = convexTest(schema);
  const tokens = await signInViaGitHub(t, "github", {
    email: "sara@gmail.com",
    name: "Sara",
    id: "someGitHubId",
  });

  expect(tokens).not.toBeNull();

  await t.run(async (ctx) => {
    const verificationCodes = await ctx.db.query("verificationCodes").collect();
    expect(verificationCodes).toHaveLength(0);
    const verifiers = await ctx.db.query("verifiers").collect();
    expect(verifiers).toHaveLength(0);
  });
});

function setupEnv() {
  process.env.SITE_URL = "http://localhost:5173";
  process.env.CONVEX_SITE_URL = CONVEX_SITE_URL;
  process.env.JWT_PRIVATE_KEY = JWT_PRIVATE_KEY;
  process.env.JWKS = JWKS;
  process.env.AUTH_GITHUB_ID = "githubClientId";
  process.env.AUTH_GITHUB_SECRET = "githubClientSecret";
}
