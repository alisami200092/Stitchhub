import { retrieveCatalogSpecs } from "./pinecone";

async function runVerification() {
  console.log("=================================================");
  console.log("🚀 STITCHHUB PINECONE & GUARDRAIL VERIFICATION");
  console.log("=================================================\n");

  // Test Case 1: Waxed Canvas Duffel with Screen Print (Should retrieve waxed canvas constraints)
  console.log("--- TEST 1: Waxed Canvas Duffel (Constraint Retrieval) ---");
  const query1 = "Rugged Waxed Canvas Weekend Duffel with screen printed artwork";
  const result1 = await retrieveCatalogSpecs(query1, 2);
  console.log("Retrieved Specs:");
  console.log(result1);
  console.log("\n-------------------------------------------------\n");

  // Test Case 2: Cordura Ballistic Briefcase (Approved method)
  console.log("--- TEST 2: Cordura Ballistic Tech Briefcase (Constraint Retrieval) ---");
  const query2 = "Cordura Ballistic Tech Briefcase with laser engraved metal plates";
  const result2 = await retrieveCatalogSpecs(query2, 2);
  console.log("Retrieved Specs:");
  console.log(result2);
  console.log("\n-------------------------------------------------\n");

  // Test Case 3: Natural Merino Wool Desk Mat (Texture/Ink Constraint)
  console.log("--- TEST 3: Natural Merino Wool Desk Mat ---");
  const query3 = "Natural Merino Wool Desk Mat custom branding";
  const result3 = await retrieveCatalogSpecs(query3, 2);
  console.log("Retrieved Specs:");
  console.log(result3);
  console.log("\n=================================================");
  console.log("✅ Verification run finished successfully!");
  console.log("=================================================");
}

runVerification().catch(console.error);
