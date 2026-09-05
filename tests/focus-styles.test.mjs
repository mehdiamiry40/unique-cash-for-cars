import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

test("compiled focus defaults permit contrasting dark-surface component indicators",async()=>{
  const file=fileURLToPath(new URL("../src/app/globals.css",import.meta.url));
  const {root}=await postcss([tailwind({base:fileURLToPath(new URL("../",import.meta.url))})])
    .process(readFileSync(file,"utf8"),{from:file});
  const layers=(node)=>{
    const names=[];
    for(let parent=node.parent;parent;parent=parent.parent)if(parent.type==="atrule"&&parent.name==="layer")names.push(parent.params);
    return names;
  };
  let defaults=0,white=0,inset=0,dark=0;
  root.walkRules(rule=>{
    if(rule.selector.includes(":where(a, button, summary, input, select, textarea):focus-visible")){
      defaults++;assert.ok(layers(rule).includes("base"));
    }
    if(rule.selector===".focus-visible\\:outline-white:focus-visible"){
      white++;assert.ok(layers(rule).includes("utilities"));
      assert.ok(rule.nodes.some(node=>node.prop==="outline-color"));
    }
    if(rule.selector===".focus-visible\\:outline-offset-\\[-4px\\]:focus-visible"){
      inset++;assert.ok(rule.nodes.some(node=>node.prop==="outline-offset"&&node.value==="-4px"));
    }
    if(rule.selector===".bg-navy"&&rule.nodes.some(node=>node.prop==="--focus-ring"))dark++;
  });
  assert.ok(defaults&&white&&inset&&dark,"Focus defaults, white overrides, inset controls and navy context must compile");
});
