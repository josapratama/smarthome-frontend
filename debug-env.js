// Debug script untuk cek environment variables
console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
console.log("BACKEND_BASE_URL:", process.env.BACKEND_BASE_URL || "NOT SET");
console.log(
  "NEXT_PUBLIC_API_URL:",
  process.env.NEXT_PUBLIC_API_URL || "NOT SET",
);
console.log("BACKEND_API_PREFIX:", process.env.BACKEND_API_PREFIX || "NOT SET");
console.log("NODE_ENV:", process.env.NODE_ENV || "NOT SET");
console.log("=====================================");

// Test URL construction
const BACKEND_URL =
  process.env.BACKEND_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";
const API_PREFIX = process.env.BACKEND_API_PREFIX || "/api/v1";
const loginUrl = `${BACKEND_URL}${API_PREFIX}/login`;

console.log("Constructed login URL:", loginUrl);

// Test if URL is valid
try {
  new URL(loginUrl);
  console.log("✅ URL is valid");
} catch (error) {
  console.log("❌ URL is invalid:", error.message);
}
