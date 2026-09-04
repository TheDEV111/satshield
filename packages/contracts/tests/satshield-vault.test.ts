import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const accounts = {
  deployer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  wallet_1: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
  wallet_2: "ST2CY5V39NHDPWSXWH9QLSFMAFFNCFNTKYR6X96F2"
};

describe("satshield-vault contract", () => {
  it("Vault owner successfully initializes and updates parameters", async () => {
    const simnet = await initSimnet();
    const result = simnet.callPublicFn(
      "satshield-vault",
      "set-parameters",
      [Cl.uint(7500), Cl.uint(7000), Cl.uint(200)],
      accounts.deployer
    );
    expect(result.result).toEqual(Cl.ok(Cl.bool(true)));
    
    // Non-owner should fail
    const errResult = simnet.callPublicFn(
      "satshield-vault",
      "set-parameters",
      [Cl.uint(7500), Cl.uint(7000), Cl.uint(200)],
      accounts.wallet_1
    );
    expect(errResult.result).toEqual(Cl.error(Cl.uint(200))); // ERR-NOT-OWNER
  });

  it("Micro-unwind reverts with ERR-HEALTH-OK if LTV is safe (< 72%)", async () => {
    const simnet = await initSimnet();
    const result = simnet.callPublicFn(
      "satshield-vault",
      "execute-unwind",
      [
        Cl.uint(100), 
        Cl.uint(90), 
        Cl.uint(5000), // LTV is 50%, safe
        Cl.contractPrincipal(accounts.deployer, "mock-sip010"),
        Cl.contractPrincipal(accounts.deployer, "mock-sip010"),
        Cl.contractPrincipal(accounts.deployer, "mock-dex"),
        Cl.contractPrincipal(accounts.deployer, "mock-lender")
      ],
      accounts.deployer
    );
    
    expect(result.result).toEqual(Cl.error(Cl.uint(202))); // ERR-HEALTH-OK
  });

  it("Micro-unwind executes successfully when LTV >= 72%", async () => {
    const simnet = await initSimnet();
    
    simnet.callPublicFn(
      "mock-sip010",
      "mint",
      [Cl.uint(1000), Cl.standardPrincipal(accounts.deployer)],
      accounts.deployer
    );
    
    const result = simnet.callPublicFn(
      "satshield-vault",
      "execute-unwind",
      [
        Cl.uint(100), 
        Cl.uint(90), 
        Cl.uint(7500), // LTV is 75%, >= 72%, trigger!
        Cl.contractPrincipal(accounts.deployer, "mock-sip010"),
        Cl.contractPrincipal(accounts.deployer, "mock-sip010"),
        Cl.contractPrincipal(accounts.deployer, "mock-dex"),
        Cl.contractPrincipal(accounts.deployer, "mock-lender")
      ],
      accounts.deployer
    );
    
    expect(result.result).toEqual(Cl.ok(Cl.uint(100))); // mock-dex swaps 1:1, so returns 100
    
    // Check events
    expect(result.events.length).toBeGreaterThan(0);
    const printEvent = result.events.find((e: any) => e.event === 'print_event');
    expect(printEvent).toBeDefined();
  });
});
