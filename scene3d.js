/* Luxury Walk: scroll-driven 3D scenes built from the real perfume photos (three.js r128).
   If WebGL or an image fails, the site falls back to the 2D photo version. */
(function(){
if(!window.THREE)return;var T=THREE,$=function(s){return document.querySelector(s)};
var cl=function(v){return Math.max(0,Math.min(1,v))},ss=function(a,b,x){x=cl((x-a)/(b-a));return x*x*(3-2*x)};
var cv=document.createElement("canvas"),R,dead=false;cv.id="gl";
try{R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){return}
document.body.prepend(cv);document.body.classList.add("gl");
R.setClearColor(0,0);var scene=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,80);
function kill(){if(dead)return;dead=true;cv.remove();document.body.classList.remove("gl")}
/* photos */
var SRC={sauvage:"images/sauvage.jpg",water:"images/water.jpg",velvet:"images/velvet.jpg",bed:"images/bed.jpg",masc:"images/masc.jpg",hand:"images/hand.jpg",wall:"images/wall.jpg"};
var cache={},loader=new T.TextureLoader();
function tex(src,cb){var c=cache[src];if(c){c.q.push(cb);if(c.t)cb(c.t);return}c=cache[src]={q:[cb],t:null};
loader.load(src,function(t){t.anisotropy=8;c.t=t;c.q.forEach(function(f){f(t)})},undefined,kill)}
/* photo card: feathered edges, bend, glint sweep, fake blur via mip bias */
var VS="uniform float bend;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.x*3.14159)*bend;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}";
var FS="uniform sampler2D map;uniform float op,br,blur,glint,feather;varying vec2 vUv;void main(){vec4 c=texture2D(map,vUv,blur);float e=smoothstep(0.,feather,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));float g=smoothstep(.1,0.,abs(vUv.x*.8+vUv.y*.5-glint))*.5;c.rgb=(c.rgb+g*vec3(1.,.86,.6))*br;gl_FragColor=vec4(c.rgb,e*op);}";
var cards=[];
function card(src,H,o){o=o||{};var u={map:{value:null},op:{value:0},br:{value:1},blur:{value:o.blur||0},glint:{value:-3},bend:{value:o.bend||0},feather:{value:o.feather||.1}};
var m=new T.Mesh(new T.PlaneGeometry(1,1,24,1),new T.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,side:T.DoubleSide}));m.scale.set(H*.75,H,1);
var g=new T.Group();g.add(m);g.visible=false;g.userData={u:u,ready:false,first:true,tg:{x:0,y:-.5,z:0,ry:0,s:1,op:0,br:1},cur:{x:0,y:-.5,z:0,ry:0,s:1,op:0,br:1}};
tex(src,function(t){u.map.value=t;var a=t.image.width/t.image.height;m.scale.set(H*a,H,1);g.userData.ready=true});scene.add(g);cards.push(g);return g}
function hide(c){c.userData.tg.op=0}
function put(c,o){var t=c.userData.tg;t.x=o.x||0;t.y=o.y||0;t.z=o.z||0;t.ry=o.ry||0;t.s=o.s==null?1:o.s;t.op=o.op==null?1:o.op;t.br=o.br==null?1:o.br;if(c.userData.first&&t.op>0){Object.assign(c.userData.cur,t);c.userData.cur.op=0;c.userData.first=false}}
function step(c,dt){var d=c.userData,t=d.tg,u=d.cur,k=1-Math.exp(-dt*6);for(var p in t)u[p]+=(t[p]-u[p])*k;
c.position.set(u.x,u.y,u.z);c.rotation.y=u.ry;c.scale.setScalar(Math.max(.001,u.s));d.u.op.value=u.op;d.u.br.value=u.br;c.visible=d.ready&&u.op>.01}
var BD={},hero=card(SRC.sauvage,3.7,{bend:.15}),NOTE=[],PER=[],PRO=[],NK=["water","velvet","bed"],PK=["masc","hand","wall"];
Object.keys(SRC).forEach(function(k){BD[k]=card(SRC[k],13,{blur:5.5,feather:.3})});
NK.forEach(function(k){NOTE.push(card(SRC[k],3.9,{bend:.22}))});PK.forEach(function(k){PER.push(card(SRC[k],3.9,{bend:.22}))});
var PL=typeof PRODUCTS!=="undefined"?PRODUCTS:[];PL.forEach(function(p){PRO.push(card(p.img,2.3,{bend:.12,feather:.08}))});
/* particles */
function pts(n,fn,col,size,op){var a=new Float32Array(n*3);for(var i=0;i<n;i++){var v=fn();a[i*3]=v[0];a[i*3+1]=v[1];a[i*3+2]=v[2]}var g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(a,3));var p=new T.Points(g,new T.PointsMaterial({color:col,size:size,transparent:true,opacity:op,depthWrite:false,blending:T.AdditiveBlending}));p.frustumCulled=false;scene.add(p);p.userData.a=a;return p}
var dust=pts(380,function(){return[(Math.random()-.5)*18,(Math.random()-.5)*10,(Math.random()-.5)*10-2]},0xe8cf9a,.05,.55);
var orb=pts(300,function(){var a=Math.random()*6.283,r=2+Math.random()*1.4;return[Math.cos(a)*r,(Math.random()-.5)*4,Math.sin(a)*r-1]},0xe9b949,.08,0);
var SN=170,spr=pts(SN,function(){return[0,0,0]},0xfff2d6,.07,0),spv=[],age=9,fired=false;
function spray(x,y){var a=spr.userData.a;for(var i=0;i<SN;i++){a[i*3]=x;a[i*3+1]=y;a[i*3+2]=.3;var s=1.2+Math.random()*2.2;spv[i]=[(Math.random()-.3)*s,(Math.random()-.1)*s*.7,(Math.random()-.2)*s*.7]}spr.geometry.attributes.position.needsUpdate=true;age=0}
/* layout */
var px=0,py=0;addEventListener("pointermove",function(e){px=e.clientX/innerWidth*2-1;py=e.clientY/innerHeight*2-1});
function size(){var w=innerWidth,h=innerHeight;R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));R.setSize(w,h);cam.aspect=w/h;cam.fov=w/h<.8?46:32;cam.updateProjectionMatrix()}size();addEventListener("resize",size);
var bpos=[0,0];window.LW3D={spray:function(){spray(bpos[0],bpos[1]);if(window.LW)LW.hiss()}};
var NC=[0xe9b949,0xe8a0b4,0x9a6a48],TC=new T.Color(0xc9a15b),last=0,hxI=-1;
function pg(el){var r=el.getBoundingClientRect();return cl(-r.top/(r.height-innerHeight))}
function frame(ts){if(dead)return;requestAnimationFrame(frame);var sb=$("#sbtn");if(sb)sb.classList.remove("on");var home=$("#p-home.on");cv.style.display=home?"block":"none";if(!home)return;
var tm=ts/1000,dt=Math.min(.05,tm-last);last=tm;
var S=pg($("#mood"))+pg($("#notes"))+pg($("#person"))+pg($("#bottle"))+pg($("#helix"));
var p6=cl((innerHeight-$("#helix").getBoundingClientRect().bottom)/innerHeight);cv.style.opacity=1-ss(.05,.7,p6);if(p6>.99)return;
var mob=innerWidth<800,side=mob?0:1.9,up=mob?.95:0,sc=mob?.72:1,cz=8.6,cy=0,bd=null,t,i;
cards.forEach(hide);Object.keys(BD).forEach(function(k){hide(BD[k])});orb.material.opacity+=(0-orb.material.opacity)*.1;
if(S<1){t=S;bd="sauvage";cz=11.5-2.9*t;put(hero,{x:0,y:.35*sc+up*.4+(-1.6*(1-ss(0,.5,t))),ry:-.45+t*.45,op:ss(0,.35,t),s:sc})}
else if(S<2){t=S-1;i=Math.min(2,Math.floor(t*3));var f=t*3-i;bd=NK[i];put(hero,{x:side,y:up,ry:-.2,op:0,s:sc,z:-2});
 NOTE.forEach(function(c,k){if(k==i)put(c,{x:side,y:up,ry:-.3+f*.6,s:sc,op:1});else if(k<i)put(c,{x:side-3.2,y:up,z:-3,ry:.7,s:sc,op:0});else put(c,{x:side+3.2,y:up,z:-3,ry:-.7,s:sc,op:0})});
 TC.setHex(NC[i]);orb.material.opacity+=(ss(0,.1,t)*(1-ss(.9,1,t))*.9-orb.material.opacity)*.1;orb.material.color.lerp(TC,.06);orb.position.set(side,up,-1);orb.rotation.y=tm*.25}
else if(S<3){t=S-2;i=Math.min(2,Math.floor(t*3));var fr=t*3-i,rot=(i+(i<2?ss(.55,.98,fr):0))*2.0944,vis=ss(.03,.2,t)*(1-ss(.9,1,t)),RR=4.6*sc;bd=PK[i];
 PER.forEach(function(c,k){var a=k*2.0944-rot,fr2=Math.cos(a)>.7;put(c,{x:side+RR*Math.sin(a),y:up,z:-RR+RR*Math.cos(a),ry:a,s:sc,op:vis*(fr2?1:.35),br:fr2?1:.45})})}
else if(S<4){t=S-3;bd="sauvage";var pop=1+.05*ss(.7,.74,t)*(1-ss(.74,.82,t)),hx=side*.6*(1-ss(.5,1,t));cz=8.6-5.9*ss(.3,.85,t);cy=.8*ss(.4,.9,t);
 put(hero,{x:hx,y:up,ry:-.7+1.4*t,op:ss(0,.15,t),s:sc*pop});hero.userData.u.glint.value=-.6+t*2.4;
 bpos=[hx,cy+.3];if(sb&&t>.2&&t<.96)sb.classList.add("on");if(t>.74&&t<.95&&!fired){fired=true;spray(hx*1,cy+.3)}if(t<.6)fired=false}
else{t=S-4;var fh=t*(PRO.length-1),RR2=4.6*sc;bd="velvet";hero.userData.u.glint.value=-3;fired=false;
 PRO.forEach(function(c,k){var d=k-fh,a=d*.628,fr3=cl(1-Math.abs(d)/1.1);put(c,{x:side+RR2*Math.sin(a),y:up-d*.2,z:-RR2+RR2*Math.cos(a),ry:a,s:sc*(1+.4*fr3),op:Math.cos(a)>0?cl(1-Math.abs(d)/3.4)*vis1(t):0,br:.5+.5*fr3})});
 var ix=Math.max(0,Math.min(PL.length-1,Math.round(fh)));if(ix!=hxI&&PL[ix]){hxI=ix;var p=PL[ix];$("#hx-name").textContent=p.n;$("#hx-by").textContent=p.b+" · "+p.t;$("#hx-pr").textContent=STORE.cur+p.pr.toLocaleString("en-US");$("#hx-add").dataset.a=p.id;$("#hx-view").dataset.v=p.id}}
function vis1(t){return ss(0,.06,t)}
if(bd&&BD[bd])put(BD[bd],{z:-7,y:up*.5,op:.6,br:.4});
cards.forEach(function(c){step(c,dt)});
var da=dust.userData.a;dust.rotation.y=tm*.02;dust.position.y=-S*.5;
age+=dt;if(age<2){var sa=spr.userData.a;for(i=0;i<SN;i++){var v=spv[i];if(!v)continue;v[0]*=.97;v[1]=v[1]*.97-.012;v[2]*=.97;sa[i*3]+=v[0]*dt*1.6;sa[i*3+1]+=v[1]*dt*1.6;sa[i*3+2]+=v[2]*dt*1.6}spr.geometry.attributes.position.needsUpdate=true}spr.material.opacity=age<2?(1-age/2)*.9:0;
cam.position.set(px*.5,cy+.2-py*.25,cz);cam.lookAt(0,cy*.9,0);R.render(scene,cam)}
requestAnimationFrame(frame);
})();
