'use strict';
// Status-only readiness probes still own the response body. Drain it before
// the caller retries or shuts its local server down (Node22/undici).
async function fetchReadyOk(url, options){
 const response=await fetch(url,options);
 await response.arrayBuffer();
 return response.ok;
}
module.exports={fetchReadyOk};
