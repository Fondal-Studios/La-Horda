'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {validateCandidate}=require('./production');
const dir=process.argv[2],result=validateCandidate(dir);
// Integration of generator -> actual PNG -> actual game metadata -> quality rejection.
// This tests the guard, not approval of the art: the known recipe has edge contacts.
assert(result.gate.frames.length>=36,'Real complete sheet required');
assert(result.gate.width>0&&result.gate.height>0);
// A corrected production registry may have a larger cell than this raw negative fixture.
assert.equal(result.gate.contract.status,'COMPATIBLE_NOT_ART_APPROVAL');
assert.equal(result.installed,false);
assert.equal(result.status,'REJECTED');
assert(result.gate.issues.some(i=>i.code==='CLIPPED_FRAME'));
fs.writeFileSync(path.join(dir,'delivery.json'),JSON.stringify(result,null,2)+'\n');
console.log('PASS: real native generation and rejection of edge-clipped poses; production unchanged');
