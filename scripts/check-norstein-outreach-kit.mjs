import {readFile} from "node:fs/promises";
const k=JSON.parse(await readFile("examples/norstein-outreach-kit.json","utf8"));
const assert=(v,m)=>{if(!v)throw new Error(m)};
assert(k.schema==="jp.norstein.outreach-kit.v1","schema mismatch");
assert(k.fundingType==="voluntary-donation"&&k.repayment===false,"funding terms changed");
assert(k.status==="public-source-ready"&&k.sent===false,"outreach status invalid");
assert(Object.values(k.links).every(v=>v.startsWith("https://")),"public link invalid");
assert(k.boundaries.donorData===false&&k.boundaries.privateSource===false&&k.boundaries.secrets===false&&k.boundaries.automaticOutreach===false&&k.boundaries.exactSendApprovalRequired===true,"outreach boundary invalid");
console.log(JSON.stringify({verified:true,kitId:k.kitId,status:k.status,sent:k.sent}));
