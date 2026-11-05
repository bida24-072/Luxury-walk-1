/* Luxury Walk: preloader, tap-to-spray sound and the 3D product viewer */
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return[].slice.call(document.querySelectorAll(s))};
var cl=function(v,a,b){return Math.max(a,Math.min(b,v))};
/* spray sound + haptics */
var ac=null;function hiss(){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();var n=ac.sampleRate*1.1,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);var s=ac.createBufferSource();s.buffer=b;var f=ac.createBiquadFilter();f.type="highpass";f.frequency.value=3500;var g=ac.createGain();g.gain.value=.25;s.connect(f);f.connect(g);g.connect(ac.destination);s.start()}catch(e){}if(navigator.vibrate)navigator.vibrate(25)}
window.LW={hiss:hiss};
var sb=$("#sbtn");if(sb)sb.onclick=function(){if(window.LW3D)LW3D.spray()};
/* preloader */
var list=$$("img").map(function(i){return i.src});if(window.PRODUCTS)PRODUCTS.forEach(function(p){list.push(p.img)});
var done=0,t0=Date.now(),pre=$("#pre"),bar=$("#pbar"),pct=$("#ppct"),fin=false;document.body.classList.add("loading");
function upd(){var v=list.length?done/list.length:1;bar.style.transform="scaleX("+v+")";pct.textContent=Math.round(v*100)+"%";if(v>=1)finish()}
function finish(){if(fin)return;fin=true;var w=Math.max(0,1900-(Date.now()-t0));setTimeout(function(){pre.classList.add("out");document.body.classList.remove("loading");setTimeout(function(){pre.remove()},1100)},w)}
list.forEach(function(s){var im=new Image();im.onload=im.onerror=function(){done++;upd()};im.src=s});upd();setTimeout(finish,7000);
/* 3D viewer */
var vw=$("#vw"),R,scene,cam,grp,front,back,glow,spr,SN=150,spv=[],age=9,run=false,rx=0,ry=0,vx=0,vy=0,zoom=7.2,zt=7.2,drag=false,lx=0,ly=0,idle=0,H=3.4,last=0,ptr={},pd=0,T=window.THREE,cur=null,tcache={};
var VS="uniform float bend;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.x*3.14159)*bend;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}";
var FS="uniform sampler2D map;uniform float br,glint,mir;varying vec2 vUv;void main(){vec2 uv=vUv;if(mir>.5)uv.x=1.-uv.x;vec4 c=texture2D(map,uv);float e=smoothstep(0.,.07,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));float g=smoothstep(.1,0.,abs(vUv.x*.8+vUv.y*.5-glint))*.5;gl_FragColor=vec4((c.rgb+g*vec3(1.,.86,.6))*br,e);}";
function mat(br,mir){return new T.ShaderMaterial({uniforms:{map:{value:null},br:{value:br},glint:{value:-3},mir:{value:mir},bend:{value:.28}},vertexShader:VS,fragmentShader:FS,transparent:true,side:T.DoubleSide,depthWrite:false})}
function init(){if(R)return true;if(!T)return false;try{R=new T.WebGLRenderer({canvas:$("#vc"),antialias:true,alpha:true})}catch(e){return false}
scene=new T.Scene();cam=new T.PerspectiveCamera(32,1,.1,50);grp=new T.Group();scene.add(grp);
var gc=document.createElement("canvas");gc.width=gc.height=256;var x=gc.getContext("2d"),g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,"rgba(255,214,140,.7)");g.addColorStop(.5,"rgba(201,161,91,.2)");g.addColorStop(1,"rgba(201,161,91,0)");x.fillStyle=g;x.fillRect(0,0,256,256);
glow=new T.Mesh(new T.PlaneGeometry(9,9),new T.MeshBasicMaterial({map:new T.CanvasTexture(gc),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));glow.position.z=-1.2;scene.add(glow);
back=new T.Mesh(new T.PlaneGeometry(1,1,24,1),mat(.28,1));back.position.z=-.09;front=new T.Mesh(new T.PlaneGeometry(1,1,24,1),mat(1,0));grp.add(back);grp.add(front);
var a=new Float32Array(SN*3),gg=new T.BufferGeometry();gg.setAttribute("position",new T.BufferAttribute(a,3));spr=new T.Points(gg,new T.PointsMaterial({color:0xfff2d6,size:.07,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));spr.frustumCulled=false;spr.userData.a=a;scene.add(spr);
var cv=$("#vc");cv.addEventListener("pointerdown",function(e){cv.setPointerCapture(e.pointerId);ptr[e.pointerId]=[e.clientX,e.clientY];drag=true;idle=0;lx=e.clientX;ly=e.clientY;pd=dist()});
cv.addEventListener("pointermove",function(e){if(!ptr[e.pointerId])return;ptr[e.pointerId]=[e.clientX,e.clientY];idle=0;var n=Object.keys(ptr).length;if(n>1){var d=dist();zt=cl(zt-(d-pd)*.01,3.4,10);pd=d;return}vx=(e.clientX-lx)*.008;vy=(e.clientY-ly)*.005;ry+=vx;rx=cl(rx+vy,-.6,.6);lx=e.clientX;ly=e.clientY});
function up(e){delete ptr[e.pointerId];if(!Object.keys(ptr).length)drag=false}cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
cv.addEventListener("wheel",function(e){e.preventDefault();zt=cl(zt+e.deltaY*.004,3.4,10)},{passive:false});addEventListener("resize",size);return true}
function dist(){var k=Object.keys(ptr);if(k.length<2)return 0;var a=ptr[k[0]],b=ptr[k[1]];return Math.hypot(a[0]-b[0],a[1]-b[1])}
function size(){if(!R||!run)return;var c=$("#vc"),w=c.clientWidth,h=c.clientHeight;R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<.8?46:32;cam.updateProjectionMatrix()}
function spray(){hiss();if(!spr)return;var p=grp.localToWorld(new T.Vector3(0,H*.36,.25)),a=spr.userData.a;for(var i=0;i<SN;i++){a[i*3]=p.x;a[i*3+1]=p.y;a[i*3+2]=p.z;var s=1.2+Math.random()*2.2;spv[i]=[(Math.random()-.5)*s*.8,(Math.random()-.2)*s*.6,(Math.random()*.9+.2)*s]}spr.geometry.attributes.position.needsUpdate=true;age=0}
function open(id){var p=PRODUCTS[id-1];if(!p)return;cur=p;$("#v-by").textContent=p.b;$("#v-n").textContent=p.n;$("#v-t").textContent=p.t;$("#v-p").textContent=STORE.cur+p.pr.toLocaleString("en-US");$("#v-add").dataset.a=p.id;$("#v-add").textContent="Add to order";
vw.classList.add("on");document.body.classList.add("loading");$("#vimg").src=p.img;$("#vimg").alt=p.b+" "+p.n;
var ok=init();vw.classList.toggle("flat",!ok);if(!ok)return;run=true;size();
var set=function(t){[front,back].forEach(function(m){m.material.uniforms.map.value=t;var s=t.image.width/t.image.height;m.scale.set(H*s,H,1)})};
if(tcache[p.img])set(tcache[p.img]);else new T.TextureLoader().load(p.img,function(t){t.anisotropy=8;tcache[p.img]=t;set(t)},undefined,function(){vw.classList.add("flat")});
rx=0;ry=-2.4;vx=vy=0;zoom=zt=7.6;idle=0;age=9;$("#v-sp").focus();requestAnimationFrame(loop)}
function close(){vw.classList.remove("on");document.body.classList.remove("loading");run=false}
function loop(ts){if(!run)return;requestAnimationFrame(loop);var tm=ts/1000,dt=Math.min(.05,tm-last);last=tm;idle+=dt;
if(!drag){ry+=vx;vx*=.94;vy*=.94;rx=cl(rx+vy,-.6,.6);if(idle>2.2){ry+=(Math.sin(tm*.7)*.5-ry)*.02;rx+=(Math.sin(tm*.5)*.08-rx)*.03}}
if(ry<-.001&&idle<.5&&!drag&&Math.abs(vx)<.001&&ry<-1)ry+=(0-ry)*.05;
grp.rotation.set(rx,ry,0);zoom+=(zt-zoom)*.1;cam.position.set(0,0,zoom);cam.lookAt(0,0,0);front.material.uniforms.glint.value=((tm*.45)%3)-1;
age+=dt;if(age<2){var a=spr.userData.a;for(var i=0;i<SN;i++){var v=spv[i];if(!v)continue;v[0]*=.97;v[1]=v[1]*.97-.012;v[2]*=.97;a[i*3]+=v[0]*dt*1.6;a[i*3+1]+=v[1]*dt*1.6;a[i*3+2]+=v[2]*dt*1.6}spr.geometry.attributes.position.needsUpdate=true}spr.material.opacity=age<2?(1-age/2)*.9:0;R.render(scene,cam)}
document.addEventListener("click",function(e){var t=e.target;if(t.dataset&&t.dataset.v)open(+t.dataset.v);if(t.id=="vx"||t.id=="vw")close();if(t.id=="v-sp")spray();if(t.id=="v-add"){t.textContent="Added ✓"}});
document.addEventListener("keydown",function(e){if(e.key=="Escape"&&run)close()});
})();
