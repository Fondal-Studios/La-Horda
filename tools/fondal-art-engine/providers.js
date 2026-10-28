'use strict';
// Provider-neutral interface. Paid providers must be implemented separately.
class ProviderError extends Error {}
class DryRunProvider{
 constructor(){this.name='dry-run';}
 async estimate(job){return {provider:this.name,job_id:job.id,currency:'USD',estimated_cost:0,executable:false};}
 async generate(job){return {provider:this.name,job_id:job.id,status:'NOT_GENERATED',files:[],note:'Dry-run only'};}
}
function getProvider(name='dry-run'){
 if(name==='dry-run')return new DryRunProvider();
 throw new ProviderError('Provider '+name+' is not configured. No external request was made.');
}
module.exports={ProviderError,DryRunProvider,getProvider};
