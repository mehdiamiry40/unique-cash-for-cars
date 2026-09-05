import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { loadTypeScriptModule } from "./helpers/load-ts-module.mjs";

async function withEnvironment(environment, secret, run) {
  const previous = { VERCEL_ENV: process.env.VERCEL_ENV, CRON_SECRET: process.env.CRON_SECRET, NODE_ENV:process.env.NODE_ENV };
  try {
    process.env.VERCEL_ENV=environment;
    process.env.CRON_SECRET=secret;
    process.env.NODE_ENV="production";
    return await run();
  } finally {
    for (const [key,value] of Object.entries(previous)) {
      if (value===undefined) delete process.env[key]; else process.env[key]=value;
    }
  }
}

function cron({dead=0,workerError=false}={}) {
  const calls=[];
  const {GET}=loadTypeScriptModule(fileURLToPath(new URL("../src/app/api/cron/quote-delivery/route.ts",import.meta.url)),{
    "next/server":{NextResponse:{json:(body,init)=>Response.json(body,init)}},
    "@/lib/quote-outbox":{processDueQuoteLeads:async (...args)=>{
      calls.push(["worker",args]);
      if(workerError)throw new Error("Private storage error");
      return {deadLettered:dead,finalizeConflicts:0,errors:0,health:{dead,pending:0,processing:0,oldestPendingAgeSeconds:0}};
    }},
    "@/lib/quote-reconciliation":{reconcileQuoteReceipts:async(options)=>{calls.push(["receipts",options]);return {checked:0,failures:0,conflicts:0};}},
    "@/lib/quote-health":{recordQuoteWorkerHealth:async(input)=>{calls.push(["health",input]);return input.workerSucceeded;}},
  });
  return {GET,calls};
}

test("cron rejects unknown environments and missing/invalid authorization before any work",async()=>{
  for(const env of ["", "preview", "development"]){
    await withEnvironment(env,"test-secret",async()=>{
      const {GET,calls}=cron();
      assert.equal((await GET(new Request("https://example.test/",{headers:{authorization:"Bearer test-secret"}}))).status,404);
      assert.equal(calls.length,0);
    });
  }
  await withEnvironment("production","test-secret",async()=>{
    const {GET,calls}=cron();
    assert.equal((await GET(new Request("https://example.test/"))).status,401);
    assert.equal(calls.length,0);
  });
});

test("terminal failures produce an unhealthy heartbeat and503; healthy work has bounded phase deadlines",async()=>{
  await withEnvironment("production","test-secret",async()=>{
    for(const dead of [0,2]){
      const {GET,calls}=cron({dead});
      const start=Date.now();
      const response=await GET(new Request("https://example.test/",{headers:{authorization:"Bearer test-secret"}}));
      assert.equal(response.status,dead?503:200);
      const result=await response.json();
      assert.equal(result.ok,!dead);
      assert.equal(calls[2][1].workerSucceeded,!dead);
      assert.ok(calls[0][1][2].deadlineMs<=start+40_050);
      assert.ok(calls[1][1].deadlineAt<=start+53_050);
    }
  });
});

test("worker exceptions publish failed health without revealing storage details",async()=>{
  await withEnvironment("production","test-secret",async()=>{
    const {GET,calls}=cron({workerError:true});
    const response=await GET(new Request("https://example.test/",{headers:{authorization:"Bearer test-secret"}}));
    assert.equal(response.status,500);
    assert.deepEqual(calls[1],["health",{workerSucceeded:false}]);
    assert.doesNotMatch(await response.text(),/Private storage error/);
  });
});
