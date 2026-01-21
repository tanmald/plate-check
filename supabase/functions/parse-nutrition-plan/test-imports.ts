// Test file to verify imports work
console.log("Testing imports...");

try {
  console.log("1. Testing unpdf import...");
  const unpdf = await import("unpdf");
  console.log("✓ unpdf imported successfully");
} catch (e) {
  console.error("✗ unpdf import failed:", e.message);
}

try {
  console.log("2. Testing AWS SDK import...");
  const aws = await import("@aws-sdk/client-textract");
  console.log("✓ AWS SDK imported successfully");
} catch (e) {
  console.error("✗ AWS SDK import failed:", e.message);
}

try {
  console.log("3. Testing docxml import...");
  const docxml = await import("https://deno.land/x/docxml@v1.0.3/mod.ts");
  console.log("✓ docxml imported successfully");
} catch (e) {
  console.error("✗ docxml import failed:", e.message);
}

console.log("Import test complete");
