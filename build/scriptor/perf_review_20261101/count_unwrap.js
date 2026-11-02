// throwaway: counts WebCrypto key ops from OUTSIDE the product (wraps subtle methods); prints per process at exit
var s=require('crypto').webcrypto.subtle,c={unwrapKey:0,wrapKey:0,deriveKey:0,deriveBits:0,verify:0,sign:0,encrypt:0,decrypt:0};
Object.keys(c).forEach(function(n){var o=s[n];if(!o)return;s[n]=function(){c[n]++;return o.apply(this,arguments)}});
process.on('exit',function(){console.error('§OPCOUNT pid='+process.pid+' '+JSON.stringify(c)+' rssMB='+(process.memoryUsage().rss/1e6|0))});
