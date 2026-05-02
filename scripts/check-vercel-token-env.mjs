const token = process.env.VERCEL_TOKEN;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(token, "VERCEL_TOKEN is required in the environment");
assert(!token.includes("paste-token-here"), "VERCEL_TOKEN must not be the placeholder value");
assert(token.length >= 20, "VERCEL_TOKEN looks too short to be a real token");

const response = await fetch("https://api.vercel.com/v2/user", {
  headers: {
    authorization: `Bearer ${token}`
  }
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Vercel token check failed with HTTP ${response.status}: ${body.slice(0, 200)}`);
}

const user = await response.json();

console.log(JSON.stringify({
  id: "check-vercel-token-env",
  status: "passed",
  token_present: true,
  token_printed: false,
  vercel_user: user?.user?.username ?? user?.user?.email ?? "authenticated"
}, null, 2));
