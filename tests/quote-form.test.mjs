import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { after, test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";

const require = createRequire(import.meta.url);
const dom = new JSDOM("<!doctype html><body></body>", { url: "https://example.test/", pretendToBeVisual: true });
for (const name of ["window", "document", "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "Event", "FormData", "sessionStorage"]) {
  globalThis[name] = name === "window" ? dom.window : dom.window[name];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot, hydrateRoot } = await import("react-dom/client");
let requests = [];
let responses = [];
let conversions = [];
let notifyFetch;

function compile(relative, imports) {
  const source = readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, TextEncoder, crypto: globalThis.crypto,
    HTMLElement, HTMLInputElement, HTMLTextAreaElement, FormData, sessionStorage,
    fetch: async (url, init) => {
      requests.push({url, ...init});
      assert.ok(responses.length, "Unexpected real service request");
      notifyFetch?.();
      return responses.shift();
    },
    require(name) {
      if (name in imports) return imports[name];
      assert.ok(["react", "react/jsx-runtime"].includes(name), `Unexpected import ${name}`);
      return require(name);
    },
  }, { filename: relative });
  return exports;
}

const validation = compile("src/lib/quote-validation.ts", {});
const { QuoteForm } = compile("src/components/QuoteForm.tsx", {
  "@/lib/quote-validation": validation,
  "next/link": { default: ({children, ...props}) => React.createElement("a", props, children) },
  "@/content/site": { site: { name:"Unique Cash For Cars", phone:{display:"0423 476 111",href:"tel:+61423476111"} } },
  "@/components/GoogleAdsTracking": {
    trackQuoteFormStart() {}, trackQuoteFormError() {},
    trackQuoteConversion(id) { conversions.push(id); },
  },
});

const details = {name:"Jamie Example",phone:"0400 000 000",suburb:"Southport",vehicle:"2016 Toyota Corolla"};
const id = "a1b2c3d4-0000-4000-8000-000000000000";
let root;
let container;
async function mount({hydrate=false}={}) {
  if (root) await act(async()=>root.unmount());
  document.body.replaceChildren();
  sessionStorage.clear();
  requests=[]; responses=[]; conversions=[]; notifyFetch=undefined;
  container=document.createElement("div"); document.body.append(container);
  if (hydrate) container.innerHTML=renderToString(React.createElement(QuoteForm));
  await act(async()=>{
    root=hydrate ? hydrateRoot(container,React.createElement(QuoteForm)) : createRoot(container);
    if (!hydrate) root.render(React.createElement(QuoteForm));
  });
}
async function fill(values=details) {
  await act(async()=>{
    for (const [name,value] of Object.entries(values)) {
      const field=container.querySelector(`[name="${name}"]`);
      field.value=value;
      field.dispatchEvent(new Event("input",{bubbles:true}));
    }
  });
}
async function submit(response) {
  const form=container.querySelector("form");
  const event=new Event("submit",{bubbles:true,cancelable:true});
  if (response) responses.push(response);
  const fetched=response ? new Promise(resolve=>{notifyFetch=resolve;}) : Promise.resolve();
  await act(async()=>{form.dispatchEvent(event); await fetched;});
  assert.equal(event.defaultPrevented,true,"Client must always cancel native navigation");
  notifyFetch=undefined;
}

after(async()=>{if(root)await act(async()=>root.unmount());dom.window.close();});

test("server-rendered forms use safe native POST, disabled submission and usable phone help",()=>{
  const markup=renderToStaticMarkup(React.createElement(React.Fragment,null,
    React.createElement(QuoteForm,{id:"first"}),React.createElement(QuoteForm,{id:"second"})));
  const fragment=JSDOM.fragment(markup);
  for (const form of fragment.querySelectorAll("form")) {
    assert.equal(form.getAttribute("method"),"post");
    assert.equal(form.getAttribute("action"),"/api/quote");
    assert.equal(form.querySelector('button[type="submit"]').disabled,true);
    assert.ok(form.querySelector('a[href="tel:+61423476111"]'));
    assert.match(form.textContent,/if this form does not become available/);
    assert.ok(form.querySelector("noscript"));
    for(const label of form.querySelectorAll("label")) assert.ok(form.querySelector(`[id="${label.htmlFor}"]`));
  }
  const ids=[...fragment.querySelectorAll("[id]")].map(element=>element.id);
  assert.equal(new Set(ids).size,ids.length,"Form instance IDs must not collide");
});

test("hydration enables the JSON protocol; ordinary success clears identity and focuses its result",async()=>{
  await mount({hydrate:true});
  assert.equal(container.querySelector('button[type="submit"]').disabled,false);
  await fill();
  await submit(Response.json({ok:true,leadId:id,delivery:"accepted"}));
  assert.equal(requests.length,1);
  assert.equal(requests[0].url,"/api/quote");
  assert.equal(requests[0].method,"POST");
  assert.equal(requests[0].headers["Content-Type"],"application/json");
  assert.match(requests[0].headers["Idempotency-Key"],validation.quoteIdPattern);
  assert.deepEqual(JSON.parse(requests[0].body).name,details.name);
  assert.equal(window.location.href,"https://example.test/");
  assert.deepEqual(conversions,[id]);
  assert.equal(sessionStorage.getItem("ucfc:quote-submission:quote"),null);
  assert.equal(document.activeElement.id,"quote");
  assert.match(container.textContent,/A1B2C3D4/);
});

test("retry retains identity, and a saved delivery failure exposes the reference without a conversion",async()=>{
  await mount();await fill();
  await submit(Response.json({error:"Unavailable"},{status:503}));
  assert.ok(container.querySelector("form"));
  await submit(Response.json({code:"quote_saved_delivery_failed",stored:true,leadId:id},{status:502}));
  assert.equal(requests[0].headers["Idempotency-Key"],requests[1].headers["Idempotency-Key"]);
  assert.match(container.textContent,/Your details are saved/);
  assert.match(container.textContent,/A1B2C3D4/);
  assert.ok(container.querySelector('a[href="tel:+61423476111"]'));
  assert.equal(document.activeElement.id,"quote");
  assert.equal(conversions.length,0);
  assert.ok(sessionStorage.getItem("ucfc:quote-submission:quote"));
});

test("long optional notes remain editable and are rejected without a request",async()=>{
  await mount();await fill({...details,condition:"x".repeat(501)});
  await submit();
  assert.equal(requests.length,0);
  assert.equal(container.querySelector('[name="condition"]').value.length,501);
  assert.equal(document.activeElement.name,"condition");
  assert.match(container.textContent,/500 characters or fewer/);
});

test("preview acknowledgement is explicit and never counts as a captured lead",async()=>{
  await mount();await fill();
  await submit(Response.json({ok:true,code:"preview_quote",stored:false}));
  assert.match(container.textContent,/Preview checked — no enquiry sent/);
  assert.equal(conversions.length,0);
  assert.doesNotMatch(container.textContent,/safely received your details/);
});

test("untrusted or malformed failure references never become the saved state",async()=>{
  await mount();await fill();
  await submit(Response.json({code:"quote_saved_delivery_failed",stored:true,leadId:"invalid",error:"Untrusted provider text"},{status:502}));
  assert.ok(container.querySelector("form"));
  assert.doesNotMatch(container.textContent,/Untrusted provider text|Your details are saved/);
  assert.equal(conversions.length,0);
});
