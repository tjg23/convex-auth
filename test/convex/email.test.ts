import { convexTest } from "convex-test";
import { expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import {
  AUTH_RESEND_KEY,
  CONVEX_SITE_URL,
  JWKS,
  JWT_PRIVATE_KEY,
} from "./test.helpers";

test("sign in with email", async () => {
  setupEnv();
  const t = convexTest(schema);

  let code;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input, init) => {
      if (
        typeof input === "string" &&
        input === "https://api.resend.com/emails"
      ) {
        expect(init.headers.Authorization).toBe(
          `Bearer ${process.env.AUTH_RESEND_KEY}`,
        );
        expect(init.body).toBeTypeOf("string");

        // Find the code after ${process.env.SITE_URL}?code=
        code = init.body.match(/\?code=([^\s\\]+)/)?.[1];
        return new Response(null, { status: 200 });
      }
      throw new Error("Unexpected fetch");
    }),
  );

  await t.action(api.auth.signIn, {
    provider: "resend",
    params: { email: "sara@gmail.com" },
  });
  vi.unstubAllGlobals();

  const tokens = await t.action(api.auth.verifyCode, {
    params: { code },
  });

  expect(tokens).not.toBeNull();
});

function setupEnv() {
  process.env.SITE_URL = "http://localhost:5173";
  process.env.CONVEX_SITE_URL = CONVEX_SITE_URL;
  process.env.JWT_PRIVATE_KEY = JWT_PRIVATE_KEY;
  process.env.JWKS = JWKS;
  process.env.AUTH_RESEND_KEY = AUTH_RESEND_KEY;
}
