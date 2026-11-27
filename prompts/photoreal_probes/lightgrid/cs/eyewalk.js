(function(){ var A=APP, T=THREE, LZ=LightZones, Z=LZ.get(), cam=A.camera.position, out=[]; var P=[[3.9,1.2,-8],[4,1.2,-8.1],[4.3,1.2,-8.1],[4,1.2,-8.2],[2.7,1.2,-8.4]];
 var cellOf=function(x,y,z){var i=Math.floor((x-Z.org.x)/Z.cell),j=Math.floor((y-Z.org.y)/Z.cell),k=Math.floor((z-Z.org.z)/Z.cell);return (i<0||j<0||k<0||i>=Z.nx||j>=Z.ny||k>=Z.nz)?-1:i+j*Z.nx+k*Z.nx*Z.ny;};
 P.forEach(function(q){ var p={x:q[0],y:q[1],z:q[2]}, tx=cam.x-p.x,ty=cam.y-p.y,tz=cam.z-p.z,tl=Math.hypot(tx,ty,tz); tx/=tl;ty/=tl;tz/=tl; var walk=[];
   for(var s=1;s<=12;s++){var c=cellOf(p.x+tx*.25*s,p.y+ty*.25*s,p.z+tz*.25*s); if(c<0){walk.push('off');break;} var v=Z.zone[c]; walk.push(v===65535?'S':(v&0x3fff)); if(v!==65535)break;}
   var old=LZ.surfaceInfo(p,{x:0,y:1,z:0}); out.push(q.join(',')+' walk='+walk.join('>')+' oldRule='+old.zone); });
 return JSON.stringify({cam:[cam.x,cam.y,cam.z].map(function(v){return +v.toFixed(2)}),pts:out}); })()
