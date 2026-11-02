// throwaway probe: distinct (wrapped bytes + wrapping key info) unwrapKey calls vs total, per process
var s=require('crypto').webcrypto.subtle,o=s.unwrapKey,tot=0,seen=new Set(),h=require('crypto');
s.unwrapKey=function(fmt,wrapped,k){tot++;seen.add(h.createHash('sha1').update(Buffer.from(wrapped)).digest('hex')+'|'+(k&&k.algorithm?'':''));return o.apply(this,arguments)};
process.on('exit',function(){if(tot)console.error('§UNWRAP_DISTINCT pid='+process.pid+' total='+tot+' distinct_wrapped='+seen.size)});
