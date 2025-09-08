const BASE_URL = process.env.AFFORD_BASE_URL || "http://20.244.56.144/evaluation-service";

let tokenCache = "";
let tokenExpiry = 0;

async function getAuthToken() {
  const now = Date.now();
  if (tokenCache && tokenExpiry > now + 5000) return tokenCache;

  const body = {
    email: "dhawalsrivastava2583@gmail.com",
    name: "Dhawal Srivastava",
    rollNo: "2201641640021",
    accessCode: "sAWTuR",
    clientID: "4b527a22-b41c-4b39-a067-2b35183279e7",
    clientSecret: "PTmTWrnPzapxdaTU"
  };

  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Auth failed ${res.status}`);
  const data = await res.json();
  const tokenType = data.token_type || "Bearer";
  const access = data.access_token || data.accessToken || data.token || "";
  tokenCache = `${tokenType} ${access}`.trim();
  const expiresIn = Number(data.expires_in || data.expiresIn || 300) * 1000;
  tokenExpiry = now + expiresIn;
  return tokenCache;
}

export async function Log(stack, level, pkg, message) {
  try {
    const s = (stack || "").toLowerCase();
    const l = (level || "").toLowerCase();
    const p = (pkg || "").toLowerCase();
    const m = typeof message === "string" ? message : JSON.stringify(message);

    const token = await getAuthToken();
    await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ stack: s, level: l, package: p, message: m }),
    });
  } catch (e) {
  }
}
