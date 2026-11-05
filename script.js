/* ====== EDIT THESE ====== */
var STORE={name:"Luxury Walk",phone:"26770000000",cur:"P",address:"Add your shop address here",
 hours:{1:[9,18],2:[9,18],3:[9,18],4:[9,18],5:[9,18],6:[9,14]}}; /* phone: country code 267 + number, no + or spaces; hours: weekday(1=Mon..6=Sat):[open,close] */
var PRODUCTS=[
{id:1,n:"Sauvage Elixir",b:"Dior",img:"images/p1.jpg",pr:1900,c:["Designer","Fresh"],t:"Lavender, spices, licorice"},
{id:2,n:"Khamrah Qahwa",b:"Lattafa",img:"images/p2.jpg",pr:450,c:["Arabian","Warm"],t:"Coffee, cinnamon, vanilla"},
{id:3,n:"Stronger With You Absolutely",b:"Emporio Armani",img:"images/p3.jpg",pr:1350,c:["Designer","Warm"],t:"Amber, vanilla, tonka"},
{id:4,n:"Eclaire",b:"Lattafa",img:"images/p4.jpg",pr:420,c:["Arabian","Sweet"],t:"Milk, caramel, vanilla"},
{id:5,n:"Le Male Elixir",b:"Jean Paul Gaultier",img:"images/p5.jpg",pr:1500,c:["Designer","Sweet"],t:"Honey, mint, tonka"},
{id:6,n:"Spicebomb Extreme",b:"Viktor & Rolf",img:"images/p6.jpg",pr:1400,c:["Designer","Warm"],t:"Tobacco, vanilla, spice"},
{id:7,n:"Uomo Born in Roma",b:"Valentino",img:"images/p7.jpg",pr:1300,c:["Designer","Fresh"],t:"Mint, ginger, vetiver"},
{id:8,n:"Asad Bourbon",b:"Lattafa",img:"images/p8.jpg",pr:380,c:["Arabian","Warm"],t:"Pepper, bourbon, vanilla"},
{id:9,n:"Bleu de Chanel EDP",b:"Chanel",img:"images/p9.jpg",pr:1800,c:["Designer","Fresh"],t:"Citrus, cedar, incense"},
{id:10,n:"Y Le Parfum",b:"Yves Saint Laurent",img:"images/p10.jpg",pr:1500,c:["Designer","Fresh"],t:"Apple, sage, cedar"}];
/* ======================== */
var $=function(s,e){return(e||document).querySelector(s)},$$=function(s,e){return[].slice.call((e||document).querySelectorAll(s))};
var cl=function(v){return Math.max(0,Math.min(1,v))},ss=function(a,b,x){x=cl((x-a)/(b-a));return x*x*(3-2*x)};
var P=function(n){return STORE.cur+n.toLocaleString("en-US")};
var wa=function(t){return"https://wa.me/"+STORE.phone+"?text="+encodeURIComponent(t)};
["#fab","#wa-home","#wa-visit"].forEach(function(s){$(s).href=wa("Hi "+STORE.name+", I would like to ask about your perfumes.")});
$("#addr").textContent=STORE.address;$("#fromline").textContent="Fragrances from "+P(Math.min.apply(null,PRODUCTS.map(function(p){return p.pr}))*1)+". Pay on delivery.";
/* persons */
var PS=[["masc","For the man who never has to raise his voice."],["hand","For the woman who is why the room goes quiet."],["wall","For the one who gives, and is never forgotten."]];
$("#p-stk").innerHTML=PS.map(function(s,i){return'<div class="sc'+(i?"":" on")+'"><div class="bg" style="background-image:url(images/'+s[0]+'.jpg)"></div><img alt="" src="images/'+s[0]+'.jpg"><div class="tx"><span class="eye">Scene '+(i+1)+' of 3</span><h2>'+s[1]+'</h2></div></div>'}).join("");
/* cart */
var cart={};
function card(p){return'<div class="card"><div class="ci"><img loading="lazy" alt="'+p.b+' '+p.n+'" src="'+p.img+'"></div><div class="b"><small>'+p.b+'</small><h3>'+p.n+'</h3><small>'+p.t+'</small><span class="pr">'+P(p.pr)+'</span></div><div class="cb"><button data-a="'+p.id+'">Add to order</button><button data-v="'+p.id+'">3D view</button></div></div>'}
$("#feat").innerHTML=[2,8,4].map(function(i){return card(PRODUCTS[i-1])}).join("");
var cats=["All","Designer","Arabian","Fresh","Warm","Sweet"];
$("#chips").innerHTML=cats.map(function(c,i){return'<button class="chip" aria-pressed="'+!i+'">'+c+'</button>'}).join("");
function grid(f){$("#grid").innerHTML=PRODUCTS.filter(function(p){return f=="All"||p.c.indexOf(f)>-1}).map(card).join("")}grid("All");
$$(".chip").forEach(function(b){b.onclick=function(){$$(".chip").forEach(function(x){x.setAttribute("aria-pressed",x==b)});grid(b.textContent)}});
function sum(){var n=0,t=0;for(var k in cart){var p=PRODUCTS[k-1];n+=cart[k];t+=cart[k]*p.pr}return[n,t]}
function render(){var s=sum(),b=$("#cbar");b.classList.toggle("on",s[0]>0);b.textContent=s[0]+" item"+(s[0]>1?"s":"")+" · "+P(s[1])+" · View order";$("#fab").style.display=s[0]?"none":"";
$("#citems").innerHTML=Object.keys(cart).map(function(k){var p=PRODUCTS[k-1];return'<div class="ci2"><img alt="" src="'+p.img+'"><div><b>'+p.n+'</b><br><small>'+p.b+' · '+P(p.pr)+'</small></div><div class="q"><button data-m="'+k+'" aria-label="Less">−</button>'+cart[k]+'<button data-a="'+k+'" aria-label="More">+</button></div></div>'}).join("")||"<p>Your order is empty.</p>";
$("#ctot").textContent="Total "+P(s[1])}
document.addEventListener("click",function(e){var t=e.target;
if(t.dataset.a){cart[t.dataset.a]=(cart[t.dataset.a]||0)+1;render()}
if(t.dataset.m){if(--cart[t.dataset.m]<1)delete cart[t.dataset.m];render();if(!sum()[0])$("#drawer").classList.remove("on")}
if(t.id=="cbar")$("#drawer").classList.add("on");if(t.id=="dx"||t.id=="drawer")$("#drawer").classList.remove("on")});
$("#csend").onclick=function(){var s=sum();if(!s[0])return;var m="Hi "+STORE.name+", I would like to order:\n"+Object.keys(cart).map(function(k){return"- "+cart[k]+" x "+PRODUCTS[k-1].b+" "+PRODUCTS[k-1].n+" ("+P(PRODUCTS[k-1].pr)+")"}).join("\n")+"\nTotal: "+P(s[1])+"\nName: "+($("#cn").value||"-")+"\nDelivery area: "+($("#ca").value||"Gaborone")+"\nPayment: on delivery";window.open(wa(m),"_blank")};
render();
/* booking */
var slot="",bd=$("#bd");function iso(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
var now=new Date();bd.min=iso(now);
function slots(){var d=bd.value?new Date(bd.value+"T12:00:00"):null,h=d&&STORE.hours[d.getDay()],box=$("#slots");slot="";
if(!d){box.innerHTML="<small>Choose a date first.</small>";return}if(!h){box.innerHTML="<small>We are closed that day. Pick another date.</small>";return}
var o="";for(var x=h[0];x<h[1];x++){var late=iso(now)==bd.value&&x<=now.getHours();o+='<button type="button" aria-pressed="false" '+(late?"disabled":"")+'>'+("0"+x).slice(-2)+':00</button>'}box.innerHTML=o}
bd.onchange=slots;slots();
$("#slots").onclick=function(e){if(e.target.tagName!="BUTTON")return;slot=e.target.textContent;$$("#slots button").forEach(function(b){b.setAttribute("aria-pressed",b==e.target)})};
$("#bf").onsubmit=function(e){e.preventDefault();var er=$("#be");er.textContent="";
if(!bd.value||!slot||!$("#bn").value.trim()||!$("#bp").value.trim()){er.textContent="Please choose a date and time, and add your name and phone.";return}
var d=new Date(bd.value+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
window.open(wa("Hi "+STORE.name+", I would like to book:\nService: "+$("#bs").value+"\nDate: "+d+"\nTime: "+slot+"\nGuests: "+$("#bg").value+"\nName: "+$("#bn").value+"\nPhone: "+$("#bp").value+($("#bm").value?"\nNotes: "+$("#bm").value:"")),"_blank")};
/* router */
var names=["home","shop","book","visit"];
function route(){var h=location.hash.slice(1);if(names.indexOf(h)<0)h="home";$$(".page").forEach(function(p){p.classList.toggle("on",p.id=="p-"+h)});$$("nav div a").forEach(function(a){a.classList.toggle("on",a.getAttribute("href")=="#"+h)});scrollTo(0,0)}
addEventListener("hashchange",route);
/* scroll engine */
var NC=["#e9b949","#e8a0b4","#7a4e34"],NE=["Top note","Heart note","Base note"];
function prog(el){var r=el.getBoundingClientRect();return cl(-r.top/(r.height-innerHeight))}
function tick(){$("#nav").classList.toggle("s",scrollY>40);if(!$("#p-home.on"))return;
var p=prog($("#mood"));$("#m-img").style.opacity=ss(0,.2,p)*(1-ss(.9,1,p));$("#m-img").style.transform="translate(-50%,-50%) scale("+(.82+.3*p)+")";
$("#m1").style.opacity=ss(.12,.28,p)*(1-ss(.42,.52,p));$("#m2").style.opacity=ss(.58,.75,p);
p=prog($("#notes"));var i=Math.min(2,Math.floor(p*3));$("#n-bar").style.width=p*100+"%";$("#tint").style.setProperty("--c",NC[i]);$("#tint").style.background="radial-gradient(80% 80% at 25% 50%,"+NC[i]+",transparent 70%)";$("#n-eye").textContent=NE[i];
$$("#notes .ns").forEach(function(e,k){e.classList.toggle("on",k==i)});$$("#notes .ni img").forEach(function(e,k){e.classList.toggle("on",k==i)});
p=prog($("#person"));i=Math.min(2,Math.floor(p*3));$$("#p-stk .sc").forEach(function(e,k){e.classList.toggle("on",k==i)});
p=prog($("#bottle"));$("#b-img").style.transform="rotateY("+(-38+76*p)+"deg) scale("+(1+.8*ss(.35,.85,p))+")";$("#b-img").style.transformOrigin="50% 35%";
$("#bc1").classList.toggle("on",p<.33);$("#bc2").classList.toggle("on",p>=.33&&p<.7);$("#bc3").classList.toggle("on",p>=.7);$("#ring").classList.toggle("on",p>=.7)}
route();(function L(){tick();requestAnimationFrame(L)})();
