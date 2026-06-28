const https = require("https");

const SUPABASE_URL = "https://foknmqtemkfperlccpdz.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZva25tcXRlbWtmcGVybGNjcGR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjY0NDk0NSwiZXhwIjoyMDk4MjIwOTQ1fQ.OQsP3hiaHDm_RdAFex_nsRKaHETNppaoLwefEt7K1qo";

function supabasePatch(id, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: "foknmqtemkfperlccpdz.supabase.co",
      port: 443,
      path: `/rest/v1/promotions?id=eq.${id}`,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "return=minimal",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(true);
        else reject(new Error(`HTTP ${res.statusCode}: ${body}`));
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function fix() {
  const updates = [
    { id: "cc2a0b6a-ecb2-4895-ab09-7682246d1f3c", title: "渣打 Smart 超市" },
    { id: "2fa4ac3e-609a-4042-858f-034c36581464", title: "DBS COMPASS VISA" },
    { id: "e8502c03-078e-44b6-884d-e959bd1e72f2", title: "Mox Credit" },
  ];

  for (const { id, title } of updates) {
    try {
      await supabasePatch(id, { category: "supermarket" });
      console.log(`✅ ${title}: groceries → supermarket`);
    } catch (e) {
      console.error(`❌ ${title}: ${e.message}`);
    }
  }
  console.log("\nDone!");
}

fix();
