/* GPSA tulip engine — shared by tulip_editor.html and route_studio.html.
   Spec grammar mirrors tools/recce_tulips.py (parse_spec / parse_draw). */
"use strict";

/* ---------- CSV ---------- */
function parseCSV(text){
  const rows=[]; let row=[], cell="", q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(q){ if(ch==='"'){ if(text[i+1]==='"'){cell+='"';i++;} else q=false; } else cell+=ch; }
    else if(ch==='"') q=true;
    else if(ch===','){ row.push(cell); cell=""; }
    else if(ch==='\n'||ch==='\r'){ if(ch==='\r'&&text[i+1]==='\n')i++;
      row.push(cell); cell=""; if(row.length>1||row[0]!=="")rows.push(row); row=[]; }
    else cell+=ch;
  }
  if(cell!==""||row.length){ row.push(cell); rows.push(row); }
  return rows;
}
function toCSV(header,rows){
  const esc=v=>{ v=(v==null?"":String(v)); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; };
  return [header.map(esc).join(","), ...rows.map(r=>header.map(h=>esc(r[h])).join(","))].join("\n")+"\n";
}

/* ---------- specs ---------- */
/* arms: [{a:<deg>, off:<units along route, -55..55, 0=junction>}] */
function parseSpec(s){
  if(!s||!s.trim()) return null;
  s=s.trim();
  if(s==="d"||s.startsWith("d ")) return {draw:parseDraw(s)};
  const sp={turn:null,arms:[],rb:false,rbu:false,dirt:false,cs:1,lc:false,br:false,f:0,warn:0,sign:"",rsign:"",corners:{},end:0,del:false};
  const addArm=(a,off,len)=>{ if(!sp.arms.some(x=>x.a===a&&x.off===off)){ const m={a,off}; if(len!=null&&!isNaN(len)&&Math.round(len)!==38) m.len=Math.max(12,Math.min(80,Math.round(len))); sp.arms.push(m); } };
  for(const tok of s.toLowerCase().split(/\s+/)){
    if(tok.startsWith("a:")){ const v=parseFloat(tok.slice(2)); if(!isNaN(v)) sp.turn=Math.max(-160,Math.min(160,Math.round(v))); }
    else if(tok.startsWith("cs:")){ const v=parseInt(tok.slice(3)); if(v>=0&&v<=3) sp.cs=v; }
    else if(tok.startsWith("arm:")){
      const [av,rest]=tok.slice(4).split("@");
      let ov=rest, lv;                                     // rest can be "off" or "off*len"
      if(rest!=null && rest.indexOf("*")>=0){ const p=rest.split("*"); ov=p[0]; lv=p[1]; }
      const a=parseFloat(av), off=parseFloat(ov||"0"), len=lv!=null?parseFloat(lv):undefined;
      if(!isNaN(a)) addArm(Math.max(-170,Math.min(170,Math.round(a))), isNaN(off)?0:Math.max(-240,Math.min(240,Math.round(off))), len);   // off up to ±240 so it can carry a roundabout ring/stem position
    }
    else if(tok==="x"){ addArm(-90,0); addArm(0,0); addArm(90,0); }
    else if(tok==="al") addArm(-90,0);
    else if(tok==="aa") addArm(0,0);
    else if(tok==="ar") addArm(90,0);
    else if(["rb","rbu","dirt","lc","br"].includes(tok)) sp[tok]=true;
    else if(tok==="stop") sp.end=1;                 // flat bar (old "stop" spelling)
    else if(tok==="ball") sp.end=2;                 // round blob ending
    else if(tok.startsWith("bend:")){ const v=parseFloat(tok.slice(5)); if(!isNaN(v)) sp.bend=Math.max(-MAXSHIFT,Math.min(MAXSHIFT,Math.round(v))); }   // chicane shift of the exit base
    else if(tok==="f") sp.f=1;         // fuel: 1=bottom-right, 2=bottom-left
    else if(tok==="f2") sp.f=2;
    else if(tok==="!") sp.warn=1;      // warn: 1=orange, 2=red
    else if(tok==="!!") sp.warn=2;
    else if(tok.startsWith("sign:")) sp.sign=tok.slice(5);   // speed sign, top-right
    else if(tok.startsWith("rsign:")) sp.rsign=tok.slice(6); // road sign, bottom-left
    else if(tok.startsWith("corner:")){ const eq=tok.indexOf("="); // per-corner symbol: corner:tl=rs_stops
      if(eq>7){ const k=tok.slice(7,eq), v=tok.slice(eq+1); if(k&&v) sp.corners[k]=v; } }
    else if(tok==="del") sp.del=true;
  }
  if(sp.rbu) sp.rb=true;
  return sp;
}
function specToString(sp){
  if(sp.draw) return drawToString(sp.draw);
  if(sp.del) return "del";
  const toks=["a:"+(sp.turn==null?0:sp.turn)];
  for(const m of [...sp.arms].sort((x,y)=>x.a-y.a||x.off-y.off)){
    const dl=m.len==null||Math.round(m.len)===38;         // default length? then shorthand is fine
    if(!m.off&&dl&&m.a===-90) toks.push("al");
    else if(!m.off&&dl&&m.a===0) toks.push("aa");
    else if(!m.off&&dl&&m.a===90) toks.push("ar");
    else { let t="arm:"+m.a; if(m.off||!dl) t+="@"+(m.off||0); if(!dl) t+="*"+Math.round(m.len); toks.push(t); }
  }
  if(sp.rb) toks.push(sp.rbu?"rbu":"rb");
  if(sp.dirt) toks.push("dirt");
  if(sp.cs!==undefined&&sp.cs!==1) toks.push("cs:"+sp.cs);
  for(const [k,t] of [["lc","lc"],["br","br"]]) if(sp[k]) toks.push(t);
  if(sp.end===1) toks.push("stop"); else if(sp.end===2) toks.push("ball");
  if(sp.bend) toks.push("bend:"+Math.round(sp.bend));
  if(sp.f===1) toks.push("f"); else if(sp.f===2) toks.push("f2");
  if(sp.warn===1) toks.push("!"); else if(sp.warn===2) toks.push("!!");
  if(sp.sign) toks.push("sign:"+sp.sign);
  if(sp.rsign) toks.push("rsign:"+sp.rsign);
  if(sp.corners) for(const k of ["tl","tr","bl","br"]) if(sp.corners[k]) toks.push("corner:"+k+"="+sp.corners[k]);
  return toks.join(" ");
}
function parseDraw(s){
  const els=[];
  for(const tok of s.split(/\s+/).slice(1)){
    const [kind,args]=tok.split(":"); if(!args)continue;
    const a=args.split(",");
    try{
      if(kind==="l") els.push({k:'l',p:a.slice(0,4).map(Number),w:+(a[4]??9),ss:+(a[5]??0),es:+(a[6]??0),ds:+(a[7]??0)});
      else if(kind==="q") els.push({k:'q',p:a.slice(0,6).map(Number),w:+(a[6]??9),ss:+(a[7]??0),es:+(a[8]??0),ds:+(a[9]??0)});
      else if(kind==="c") els.push({k:'c',p:a.slice(0,3).map(Number),fill:+(a[3]??0)});
      else if(kind==="b") els.push({k:'b',p:a.slice(0,4).map(Number)});
      else if(kind==="s") els.push({k:'s',name:a[0],p:[+a[1],+a[2]],sc:+(a[3]??1)});
      else if(kind==="t") els.push({k:'t',p:[+a[0],+a[1]],sz:+(a[2]??18),text:decodeURIComponent(a.slice(3).join(","))});
      else if(kind==="i") els.push({k:'i',p:[+a[0],+a[1]],w:+a[2],h:+a[3],data:a.slice(4).join(",")});
    }catch(e){}
  }
  return els;
}
function drawToString(els){
  const n=v=>Math.round(v);
  return "d "+els.map(e=>{
    if(e.k==='l') return `l:${e.p.map(n).join(",")},${n(e.w)},${e.ss},${e.es},${e.ds?1:0}`;
    if(e.k==='q') return `q:${e.p.map(n).join(",")},${n(e.w)},${e.ss},${e.es},${e.ds?1:0}`;
    if(e.k==='c') return `c:${e.p.map(n).join(",")},${e.fill?1:0}`;
    if(e.k==='b') return `b:${e.p.map(n).join(",")}`;
    if(e.k==='s') return `s:${e.name},${n(e.p[0])},${n(e.p[1])},${(e.sc||1).toFixed(2)}`;
    if(e.k==='t') return `t:${n(e.p[0])},${n(e.p[1])},${n(e.sz||18)},${encodeURIComponent(e.text||"")}`;
    if(e.k==='i') return `i:${n(e.p[0])},${n(e.p[1])},${n(e.w)},${n(e.h)},${e.data}`;
  }).join(" ");
}

const FUEL=["fuel","ypf","shell","axion","gulf","petro","repsol","texaco","terpel","primax","pecsa","puma","zeuss"];
const WARN=/\b(care|caution|children|don't go|warning|rough|sandy|bump|dip|easy to miss|narrow|ford)\b/;
function parseTurn(t){
  t=(t||"").toLowerCase();
  if(t.includes("sharp left"))return -135;
  if(t.includes("sharp right"))return 135;
  if(/\btl\b|turn left|left at/.test(t))return -90;
  if(/\btr\b|turn right|right at/.test(t))return 90;
  if(["follow road left","keep left","bear left","fork left"].some(k=>t.includes(k)))return -45;
  if(["follow road right","keep right","bear right","fork right"].some(k=>t.includes(k)))return 45;
  if(/\bso\b|straight on/.test(t))return 0;
  if(t.includes("1st exit"))return 90;
  if(t.includes("2nd exit"))return 0;
  if(t.includes("3rd exit"))return -90;
  return null;
}
function specFromText(text){
  const t=(text||"").toLowerCase();
  const sp={turn:parseTurn(t)||0,arms:[],rb:false,rbu:false,dirt:false,cs:1,lc:false,br:false,f:0,warn:0,sign:"",rsign:"",corners:{},end:0,del:false};
  if(t.includes("delete")||t.includes("pressed in error")){ sp.del=true; return sp; }
  sp.rb=t.includes("roundabout")||["1st exit","2nd exit","3rd exit"].some(k=>t.includes(k));
  if(["xroad","x road","crossroad","cross road"].some(k=>t.includes(k))) sp.arms.push({a:-90,off:0},{a:0,off:0},{a:90,off:0});
  else if(Math.abs(sp.turn)>=60&&!sp.rb) sp.arms.push({a:0,off:0});
  sp.lc=t.includes("level crossing")||t.includes("cattle grid");
  sp.br=t.includes("bridge");
  sp.f=FUEL.some(k=>t.includes(k))?1:0;
  sp.warn=WARN.test(t)?1:0;
  if(t.includes("stop at hotel")||t.startsWith("stop ")||t.includes("finish")) sp.end=1;
  return sp;
}

/* ---------- drawing ---------- */
const TW=188,THh=160,CXX=94,CYY=86,EX=94,EY=148;
const IMGCACHE={};
const INKC="#14141a", AMBC="#e9940c";
function ray(a,len,fx=CXX,fy=CYY){ const r=a*Math.PI/180; return [fx+len*Math.sin(r), fy-len*Math.cos(r)]; }
function endcap(ctx,x,y,ang,style,w){
  if(style===1){ ctx.beginPath(); ctx.arc(x,y,8,0,7); ctx.fill(); }
  else if(style===2){ ctx.lineWidth=w;
    const p1=ray(ang+145,20,x,y), p2=ray(ang-145,20,x,y);
    ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(x,y); ctx.lineTo(...p2); ctx.stroke(); }
  else if(style===3){ ctx.lineWidth=8;
    const p1=ray(ang+90,13,x,y), p2=ray(ang-90,13,x,y);
    ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.stroke(); }
}
function drawStamp(ctx,name,x,y,sc){
  if(name.startsWith("rs_")){ drawSign(ctx,name.slice(3),x,y,sc); return; }
  ctx.strokeStyle=INKC; ctx.fillStyle=INKC; ctx.lineWidth=4;
  if(name==="br"){ ctx.lineWidth=3.5;
    ctx.beginPath(); ctx.moveTo(x-14*sc,y+11*sc); ctx.quadraticCurveTo(x-14*sc,y-9*sc,x-4*sc,y-9*sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+14*sc,y+11*sc); ctx.quadraticCurveTo(x+14*sc,y-9*sc,x+4*sc,y-9*sc); ctx.stroke(); }
  else if(name==="bw"){ ctx.lineWidth=3.5;
    ctx.beginPath(); ctx.moveTo(x-14*sc,y+2*sc); ctx.quadraticCurveTo(x-14*sc,y-16*sc,x-4*sc,y-16*sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+14*sc,y+2*sc); ctx.quadraticCurveTo(x+14*sc,y-16*sc,x+4*sc,y-16*sc); ctx.stroke();
    ctx.lineWidth=2.5;
    for(const off of [-9*sc,3*sc]){ ctx.beginPath(); ctx.arc(x+off,y+11*sc,5*sc,Math.PI*1.15,Math.PI*1.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(x+off+9*sc,y+11*sc,5*sc,Math.PI*1.15,Math.PI*1.85); ctx.stroke(); } }
  else if(name==="bro"){ ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x,y-16*sc); ctx.lineTo(x,y+16*sc); ctx.stroke();
    ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(x-16*sc,y); ctx.lineTo(x+16*sc,y); ctx.stroke();
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x-16*sc,y-6*sc); ctx.lineTo(x-16*sc,y+6*sc);
    ctx.moveTo(x+16*sc,y-6*sc); ctx.lineTo(x+16*sc,y+6*sc); ctx.stroke(); }
  else if(name.startsWith("sl")){ const num=name.slice(2);
    ctx.strokeStyle="#c02020"; ctx.lineWidth=4*sc;
    ctx.beginPath(); ctx.arc(x,y,16*sc,0,7); ctx.stroke();
    ctx.fillStyle=INKC; ctx.font=`700 ${(num.length>2?11:14)*sc}px Helvetica`;
    ctx.textAlign="center"; ctx.fillText(num,x,y+5*sc); ctx.textAlign="start"; }
  else if(name==="lc"){ for(const off of [-11*sc,11*sc]){ ctx.beginPath();
    ctx.moveTo(x+off-7,y-7); ctx.lineTo(x+off+7,y+7); ctx.moveTo(x+off-7,y+7); ctx.lineTo(x+off+7,y-7); ctx.stroke(); } }
  else if(name==="f"){ ctx.font=`700 ${32*sc}px Helvetica`; ctx.fillText("F",x-9*sc,y+14*sc); }
  else if(name==="warn"){ ctx.fillStyle=AMBC; ctx.beginPath(); ctx.arc(x,y,18*sc,0,7); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font=`700 ${28*sc}px Helvetica`; ctx.fillText("!",x-4*sc,y+10*sc); }
  else if(name==="warnr"){ ctx.fillStyle="#d21e1e"; ctx.beginPath(); ctx.arc(x,y,18*sc,0,7); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font=`700 ${28*sc}px Helvetica`; ctx.fillText("!",x-4*sc,y+10*sc); }
  else if(name==="pump"){ ctx.lineWidth=3;
    ctx.strokeRect(x-10*sc,y-15*sc,15*sc,30*sc);          // pump body
    ctx.strokeRect(x-6*sc,y-11*sc,7*sc,6*sc);             // display window
    ctx.beginPath();                                      // hose + nozzle up the right side
    ctx.moveTo(x+5*sc,y+13*sc); ctx.lineTo(x+12*sc,y+13*sc); ctx.lineTo(x+12*sc,y-6*sc);
    ctx.quadraticCurveTo(x+12*sc,y-11*sc,x+7*sc,y-11*sc); ctx.stroke(); }
  else if(name==="natl"){ ctx.strokeStyle=INKC; ctx.lineWidth=3*sc;    // UK national speed limit
    ctx.beginPath(); ctx.arc(x,y,15*sc,0,7); ctx.stroke();
    ctx.lineWidth=4*sc; ctx.beginPath(); ctx.moveTo(x+10*sc,y-10*sc); ctx.lineTo(x-10*sc,y+10*sc); ctx.stroke(); }
  else if(name==="give"){ ctx.beginPath(); ctx.moveTo(x-16*sc,y-12*sc); ctx.lineTo(x+16*sc,y-12*sc);
    ctx.lineTo(x,y+14*sc); ctx.closePath(); ctx.stroke(); }
  else if(name==="tl"){ ctx.lineWidth=3;
    ctx.strokeRect(x-8*sc,y-17*sc,16*sc,34*sc);
    for(const cy of [-9,0,9]){ ctx.beginPath(); ctx.arc(x,y+cy*sc,4,0,7); ctx.fill(); } }
  else if(name==="ford"){ ctx.lineWidth=3;
    for(const row of [-6,3]) for(const off of [-14,0,14]){
      ctx.beginPath(); ctx.arc(x+off*sc,y+row*sc,6,Math.PI*1.15,Math.PI*1.85); ctx.stroke(); } }
  else if(name==="gate"){ ctx.beginPath();
    ctx.moveTo(x-16*sc,y+10*sc); ctx.lineTo(x-16*sc,y-10*sc);
    ctx.moveTo(x+16*sc,y+10*sc); ctx.lineTo(x+16*sc,y-10*sc); ctx.stroke(); ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x-16*sc,y-6*sc); ctx.lineTo(x+16*sc,y-6*sc);
    ctx.moveTo(x-16*sc,y+2*sc); ctx.lineTo(x+16*sc,y+2*sc); ctx.stroke(); }
  else if(name==="tunnel"){ ctx.beginPath(); ctx.arc(x,y,14*sc,Math.PI,0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-14*sc,y); ctx.lineTo(x-14*sc,y+12*sc);
    ctx.moveTo(x+14*sc,y); ctx.lineTo(x+14*sc,y+12*sc); ctx.stroke(); }
  else if(name==="no"){ ctx.strokeStyle="#b41e1e"; ctx.lineWidth=5;
    ctx.beginPath(); ctx.arc(x,y,15*sc,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-9*sc,y+9*sc); ctx.lineTo(x+9*sc,y-9*sc); ctx.stroke(); }
  else if(name==="stop"){ ctx.lineWidth=8; ctx.beginPath();
    ctx.moveTo(x-13*sc,y); ctx.lineTo(x+13*sc,y); ctx.stroke(); }
  else if(name==="dng"){ ctx.strokeStyle="#c02020"; ctx.lineWidth=3.5;
    ctx.beginPath(); ctx.moveTo(x,y-15*sc); ctx.lineTo(x+16*sc,y+12*sc); ctx.lineTo(x-16*sc,y+12*sc);
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle="#c02020"; ctx.font=`700 ${20*sc}px Helvetica`; ctx.fillText("!",x-3*sc,y+9*sc); }
  else if(name==="xr"){ ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x,y-16*sc); ctx.lineTo(x,y+16*sc);
    ctx.moveTo(x-16*sc,y); ctx.lineTo(x+16*sc,y); ctx.stroke(); }
  else if(name==="tj"){ ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x-16*sc,y-8*sc); ctx.lineTo(x+16*sc,y-8*sc);
    ctx.moveTo(x,y-8*sc); ctx.lineTo(x,y+16*sc); ctx.stroke(); }
  else if(name==="mj"){ ctx.lineWidth=3.5;                       // motorway: twin carriageways + overbridge
    ctx.beginPath(); ctx.moveTo(x-6*sc,y-16*sc); ctx.lineTo(x-6*sc,y+16*sc);
    ctx.moveTo(x+6*sc,y-16*sc); ctx.lineTo(x+6*sc,y+16*sc); ctx.stroke();
    ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(x-17*sc,y); ctx.lineTo(x+17*sc,y); ctx.stroke(); }
  else if(name==="onr"||name==="offr"){ const m=name==="onr"?1:-1; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x-4*sc,y+16*sc); ctx.lineTo(x-4*sc,y-16*sc); ctx.stroke();
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x+12*sc,y+m*16*sc);
    ctx.quadraticCurveTo(x+10*sc,y,x-4*sc,y-m*6*sc); ctx.stroke(); }
  else if(name==="bld"){ ctx.lineWidth=3;
    ctx.strokeRect(x-13*sc,y-8*sc,26*sc,18*sc);
    ctx.beginPath(); ctx.moveTo(x-15*sc,y-8*sc); ctx.lineTo(x,y-17*sc); ctx.lineTo(x+15*sc,y-8*sc); ctx.stroke(); }
  else if(name==="sgn"){ ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x-5*sc,y+16*sc); ctx.lineTo(x-5*sc,y-14*sc); ctx.stroke();
    ctx.strokeRect(x-5*sc,y-14*sc,20*sc,10*sc); }
  else if(name==="tre"){ ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x,y+16*sc); ctx.lineTo(x,y+2*sc); ctx.stroke();
    ctx.beginPath(); ctx.arc(x,y-6*sc,10*sc,0,7); ctx.stroke(); }
  else if(name==="sb"){ ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(x-6*sc,y+16*sc);
    ctx.bezierCurveTo(x-16*sc,y+2*sc,x+16*sc,y-2*sc,x+6*sc,y-16*sc); ctx.stroke(); }
  else if(name==="bmp"){ ctx.lineWidth=3.5;
    for(const off of [-10*sc,2*sc]){ ctx.beginPath(); ctx.arc(x+off,y+4*sc,6*sc,Math.PI,0); ctx.stroke(); } }
}

/* ---- Road-sign collection ------------------------------------------------
   Signs now use the OFFICIAL UK gov artwork (data/tulip symbols → served at
   signs/<code>.jpg). drawGovSign renders the cached image. The
   three regulatory signs Chris didn't download (give way / stop / no entry)
   plus parking stay as vector drawings via the VEC_SIGNS branch in drawSign.
   ROAD_SIGNS is the catalogue the studio's picker reads. */
const RS_RED="#d3212c", RS_BLUE="#12489e", RS_INK="#1b1b1b";
const SIGN_BASE="signs/";
const ROAD_SIGNS=[
  {g:"Stop & give way", items:[["602","Give way"], ["601.1","Stop"], ["616","No entry"], ["619","No vehicles"]]},
  {g:"Turn & lane orders", items:[["613","No left turn"], ["612","No right turn"], ["614","No U-turn"], ["632","No overtaking"], ["606","Keep left"], ["609","Turn ahead"], ["607","One-way"], ["629.2A","Height limit"], ["629","Width limit"], ["622.1A","Weight limit"]]},
  {g:"Junctions & bends", items:[["512","Bend right"], ["512L","Bend left"], ["513","Double bend (L)"], ["513R","Double bend (R)"], ["504.1","Crossroads"], ["505.1","T-junction"], ["506.1","Side road"], ["510","Roundabout"], ["501","Stop/give way ahead"]]},
  {g:"Road & surface", items:[["516","Road narrows (both)"], ["517","Narrows (right)"], ["517L","Narrows (left)"], ["519","Single-track"], ["518","Single file"], ["811","Priority over"], ["521","Two-way traffic"], ["556","Uneven road"], ["557","Slippery road"], ["559","Falling rocks"], ["557.1","Road hump"], ["523.1","Steep hill down"], ["524.1","Steep hill up"]]},
  {g:"Bridges & water", items:[["528","Hump bridge"], ["529","Swing bridge"], ["529.1","Tunnel"], ["531.1M","Low bridge"], ["554","Ford"], ["554F","Flood"], ["554G","Gate"], ["555","Quay / river"]]},
  {g:"Level crossing", items:[["770","Crossing (barrier)"], ["771","Crossing (no barrier)"], ["779","Overhead cable"]]},
  {g:"People & animals", items:[["543","Traffic signals"], ["544","Zebra crossing"], ["544.1","Pedestrians"], ["545","Children"], ["548","Cattle"], ["549","Sheep"], ["550","Wild horses"], ["551","Wild animals"], ["552","Cattle grid"]]},
  {g:"Other hazards", items:[["562","Other danger"], ["581","Side winds"], ["583","Slow vehicles"], ["511","Slow for layout"], ["7001","Road works"], ["883","Traffic calming"]]},
  {g:"Access & info", items:[["816","No through road"], ["801","Parking"]]},
  {g:"Speed limit", items:[["670V20","20"], ["670V30","30"], ["670","40"], ["670V50","50"], ["670V60","60"], ["671","NSL"], ["674","20 zone"]]},
];
const VEC_SIGNS={giveway:1,stops:1,noentry:1,parking:1};   // drawn as vectors (not in the gov download)
/* image cache — signs load async; the studio registers a repaint hook so a
   tulip redraws the moment its sign image arrives. */
const SIGN_CACHE={};
let SIGN_ONLOAD=null;
function setSignLoadHook(fn){ SIGN_ONLOAD=fn; }
// The gov signs are JPEGs, so they arrive on a solid white block. Knock out the
// white that touches the edges (flood fill inward, stopping at the sign's coloured
// rim) so only the sign shape shows — the white INSIDE the sign is walled off by
// that rim and stays put.
function knockoutBg(img){
  const w=img.naturalWidth, h=img.naturalHeight; if(!w||!h) return null;
  const cv=document.createElement("canvas"); cv.width=w; cv.height=h;
  const c=cv.getContext("2d"); c.drawImage(img,0,0);
  let id; try{ id=c.getImageData(0,0,w,h); }catch(e){ return null; }
  const d=id.data, seen=new Uint8Array(w*h), stack=[];
  const white=i=> d[i]>226 && d[i+1]>226 && d[i+2]>226;
  const seed=(x,y)=>{ if(x<0||y<0||x>=w||y>=h) return; const p=y*w+x; if(!seen[p]){ seen[p]=1; stack.push(p); } };
  for(let x=0;x<w;x++){ seed(x,0); seed(x,h-1); }
  for(let y=0;y<h;y++){ seed(0,y); seed(w-1,y); }
  while(stack.length){
    const p=stack.pop(), i=p*4;
    if(!white(i)) continue;                 // hit the sign's coloured edge — stop here
    d[i+3]=0;                               // background pixel → transparent
    const x=p%w, y=(p-x)/w;
    seed(x+1,y); seed(x-1,y); seed(x,y+1); seed(x,y-1);
  }
  c.putImageData(id,0,0); return cv;
}
function govImg(code){
  let im=SIGN_CACHE[code]; if(im) return im;
  im=new Image();
  im.onload=()=>{ im.__ok=true; try{ im.__proc=knockoutBg(im); }catch(e){} if(SIGN_ONLOAD) SIGN_ONLOAD(); };
  im.onerror=()=>{ im.__err=true; };
  im.src=SIGN_BASE+encodeURIComponent(code)+".jpg";
  SIGN_CACHE[code]=im; return im;
}
function preloadSigns(){ try{ for(const g of ROAD_SIGNS) for(const it of g.items) if(!VEC_SIGNS[it[0]]) govImg(it[0]); }catch(e){} }
// a transparent PNG data URL of the sign (white block cut out) for <img> thumbnails
// in the picker; null until the source JPEG has loaded + been processed.
const SIGN_URL={};
function govSignURL(code){
  if(SIGN_URL[code]) return SIGN_URL[code];
  const im=govImg(code);
  if(im.__proc){ try{ return (SIGN_URL[code]=im.__proc.toDataURL("image/png")); }catch(e){} }
  return null;
}
function drawGovSign(ctx,code,x,y,sc){
  const im=govImg(code), box=42*sc;
  if(im.__ok && im.naturalWidth){
    const s=box/Math.max(im.naturalWidth,im.naturalHeight);
    const w=im.naturalWidth*s, h=im.naturalHeight*s;
    ctx.drawImage(im.__proc||im, x-w/2, y-h/2, w, h);     // __proc = same sign with the white block removed
  } else if(!im.__err){                                   // faint placeholder until it loads
    ctx.save(); ctx.strokeStyle="#c9cec6"; ctx.setLineDash([3,3]); ctx.lineWidth=1.2;
    ctx.strokeRect(x-box/2, y-box/2, box, box); ctx.restore();
  }
}
function rsAhead(ctx,x,y,ang,sz,sc){                 // arrowhead, tip at (x,y), pointing ang°
  for(const d of [148,-148]){ const b=(ang+d)*Math.PI/180;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+sz*sc*Math.cos(b), y+sz*sc*Math.sin(b)); ctx.stroke(); }
}
function rsTri(ctx,x,y,sc){                           // white warning-triangle frame, point up
  ctx.beginPath();
  ctx.moveTo(x, y-19*sc); ctx.lineTo(x+21*sc, y+16*sc); ctx.lineTo(x-21*sc, y+16*sc); ctx.closePath();
  ctx.fillStyle="#fff"; ctx.fill();
  ctx.strokeStyle=RS_RED; ctx.lineWidth=3.4*sc; ctx.stroke();
  ctx.strokeStyle=RS_INK; ctx.fillStyle=RS_INK; ctx.lineWidth=2.6*sc;
}
function drawSign(ctx,code,x,y,sc){
  if(!VEC_SIGNS[code]){ drawGovSign(ctx,code,x,y,sc); return; }   // official gov image
  ctx.save();
  ctx.lineJoin="round"; ctx.lineCap="round"; ctx.strokeStyle=RS_INK; ctx.fillStyle=RS_INK;
  const W=code!=="stops"&&code!=="giveway"&&code!=="noentry"&&code!=="parking";  // warning-triangle family
  if(W) rsTri(ctx,x,y,sc);
  if(code==="bend"||code==="bendl"){ const m=code==="bend"?1:-1; ctx.lineWidth=3*sc;
    ctx.beginPath(); ctx.moveTo(x-3*m*sc,y+13*sc); ctx.lineTo(x-3*m*sc,y+2*sc);
    ctx.quadraticCurveTo(x-3*m*sc,y-6*sc, x+6*m*sc,y-6*sc); ctx.stroke();
    rsAhead(ctx,x+6*m*sc,y-6*sc, m>0?0:180, 7,sc); }
  else if(code==="bends"){ ctx.lineWidth=3*sc; ctx.beginPath();
    ctx.moveTo(x-2*sc,y+13*sc);
    ctx.bezierCurveTo(x+9*sc,y+7*sc, x-9*sc,y-1*sc, x+2*sc,y-7*sc); ctx.stroke();
    rsAhead(ctx,x+2*sc,y-7*sc,-60,7,sc); }
  else if(code==="descent"||code==="ascent"){ const m=code==="descent"?1:-1;
    ctx.beginPath(); ctx.moveTo(x-13*m*sc,y+12*sc); ctx.lineTo(x-13*m*sc,y-6*sc);
    ctx.lineTo(x+14*m*sc,y+12*sc); ctx.closePath(); ctx.fill(); }
  else if(code==="narrows"){ ctx.lineWidth=2.8*sc; ctx.beginPath();
    ctx.moveTo(x-10*sc,y-7*sc); ctx.lineTo(x-4*sc,y+3*sc); ctx.lineTo(x-4*sc,y+12*sc);
    ctx.moveTo(x+10*sc,y-7*sc); ctx.lineTo(x+4*sc,y+3*sc); ctx.lineTo(x+4*sc,y+12*sc); ctx.stroke(); }
  else if(code==="uneven"){ ctx.lineWidth=2.8*sc; ctx.beginPath();
    ctx.moveTo(x-13*sc,y+10*sc); ctx.quadraticCurveTo(x-6.5*sc,y-4*sc, x,y+10*sc);
    ctx.quadraticCurveTo(x+6.5*sc,y-4*sc, x+13*sc,y+10*sc); ctx.stroke(); }
  else if(code==="slippery"){ ctx.lineWidth=2.3*sc;
    ctx.strokeRect(x-8*sc,y-8*sc,16*sc,7*sc);
    ctx.beginPath(); ctx.arc(x-4*sc,y-0.5*sc,1.5*sc,0,7); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+4*sc,y-0.5*sc,1.5*sc,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-7*sc,y+4*sc); ctx.quadraticCurveTo(x-11*sc,y+8*sc,x-6*sc,y+12*sc);
    ctx.moveTo(x+7*sc,y+4*sc); ctx.quadraticCurveTo(x+11*sc,y+8*sc,x+6*sc,y+12*sc); ctx.stroke(); }
  else if(code==="rocks"){ ctx.lineWidth=2.6*sc;
    ctx.beginPath(); ctx.moveTo(x-11*sc,y-7*sc); ctx.lineTo(x-11*sc,y+12*sc); ctx.stroke();
    for(const p of [[-3,-1,3],[3,5,3.6],[8,10,2.6]]){
      ctx.beginPath(); ctx.arc(x+p[0]*sc,y+p[1]*sc,p[2]*sc,0,7); ctx.fill(); } }
  else if(code==="ford"){ ctx.lineWidth=2.3*sc;
    for(const row of [-3,3,9]){ ctx.beginPath(); ctx.moveTo(x-12*sc,y+row*sc);
      ctx.quadraticCurveTo(x-6*sc,y+(row-4)*sc, x,y+row*sc);
      ctx.quadraticCurveTo(x+6*sc,y+(row+4)*sc, x+12*sc,y+row*sc); ctx.stroke(); } }
  else if(code==="xing"){ ctx.lineWidth=2.6*sc; ctx.beginPath();
    ctx.moveTo(x-11*sc,y-6*sc); ctx.lineTo(x-11*sc,y+12*sc);
    ctx.moveTo(x+11*sc,y-6*sc); ctx.lineTo(x+11*sc,y+12*sc);
    ctx.moveTo(x-11*sc,y+0*sc); ctx.lineTo(x+11*sc,y+0*sc);
    ctx.moveTo(x-11*sc,y+6*sc); ctx.lineTo(x+11*sc,y+6*sc); ctx.stroke(); }
  else if(code==="children"){ ctx.lineWidth=2*sc;
    ctx.beginPath(); ctx.arc(x-5*sc,y-6*sc,2.4*sc,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-5*sc,y-3.5*sc); ctx.lineTo(x-5*sc,y+5*sc);
    ctx.moveTo(x-5*sc,y+5*sc); ctx.lineTo(x-8*sc,y+12*sc); ctx.moveTo(x-5*sc,y+5*sc); ctx.lineTo(x-2*sc,y+12*sc);
    ctx.moveTo(x-9*sc,y+0*sc); ctx.lineTo(x-1*sc,y+2*sc); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+5*sc,y-3*sc,2.1*sc,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+5*sc,y-1*sc); ctx.lineTo(x+5*sc,y+6*sc);
    ctx.moveTo(x+5*sc,y+6*sc); ctx.lineTo(x+2.5*sc,y+12*sc); ctx.moveTo(x+5*sc,y+6*sc); ctx.lineTo(x+7.5*sc,y+12*sc);
    ctx.moveTo(x+1*sc,y+2*sc); ctx.lineTo(x+9*sc,y+1*sc); ctx.stroke(); }
  else if(code==="cattle"){
    ctx.beginPath(); ctx.ellipse(x-1*sc,y+3*sc,10*sc,5*sc,0,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+10*sc,y-1*sc,4.2*sc,3*sc,0.4,0,7); ctx.fill();
    ctx.lineWidth=1.8*sc; ctx.beginPath();
    ctx.moveTo(x+9*sc,y-4*sc); ctx.lineTo(x+7*sc,y-8*sc);
    ctx.moveTo(x+12*sc,y-4*sc); ctx.lineTo(x+14*sc,y-8*sc); ctx.stroke();
    ctx.lineWidth=2*sc; ctx.beginPath();
    for(const lx of [-8,-3,3,7]){ ctx.moveTo(x+lx*sc,y+7*sc); ctx.lineTo(x+lx*sc,y+12*sc); }
    ctx.moveTo(x-10*sc,y+1*sc); ctx.lineTo(x-13*sc,y+8*sc); ctx.stroke(); }
  else if(code==="wild"){
    ctx.beginPath(); ctx.ellipse(x-2*sc,y+4*sc,8*sc,4.5*sc,0,0,7); ctx.fill();
    ctx.lineWidth=3.2*sc; ctx.beginPath(); ctx.moveTo(x+4*sc,y+1*sc); ctx.lineTo(x+9*sc,y-6*sc); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x+10*sc,y-8*sc,2.6*sc,2*sc,0.5,0,7); ctx.fill();
    ctx.lineWidth=1.6*sc; ctx.beginPath();
    ctx.moveTo(x+9*sc,y-10*sc); ctx.lineTo(x+7*sc,y-14*sc);
    ctx.moveTo(x+9*sc,y-10*sc); ctx.lineTo(x+11*sc,y-14*sc);
    ctx.moveTo(x+11*sc,y-10*sc); ctx.lineTo(x+13*sc,y-13*sc); ctx.stroke();
    ctx.lineWidth=2*sc; ctx.beginPath();
    for(const lx of [-7,-3,2,5]){ ctx.moveTo(x+lx*sc,y+7*sc); ctx.lineTo(x+lx*sc,y+12*sc); } ctx.stroke(); }
  else if(code==="roundabout"){ ctx.lineWidth=2.6*sc; const R=8*sc, cy=y+3*sc;
    for(const base of [0,120,240]){ const a0=(base+12)*Math.PI/180, a1=(base+92)*Math.PI/180;
      ctx.beginPath(); ctx.arc(x,cy,R,a0,a1); ctx.stroke();
      const ex=x+R*Math.cos(a1), ey=cy+R*Math.sin(a1);
      rsAhead(ctx,ex,ey,(a1*180/Math.PI)+90,5,sc); } }
  else if(code==="xroads"){ ctx.lineWidth=3*sc; ctx.beginPath();
    ctx.moveTo(x,y-8*sc); ctx.lineTo(x,y+13*sc);
    ctx.moveTo(x-11*sc,y+2*sc); ctx.lineTo(x+11*sc,y+2*sc); ctx.stroke(); }
  else if(code==="twoway"){ ctx.lineWidth=2.6*sc;
    ctx.beginPath(); ctx.moveTo(x-5*sc,y+12*sc); ctx.lineTo(x-5*sc,y-7*sc); ctx.stroke(); rsAhead(ctx,x-5*sc,y-7*sc,-90,6,sc);
    ctx.beginPath(); ctx.moveTo(x+5*sc,y-7*sc); ctx.lineTo(x+5*sc,y+12*sc); ctx.stroke(); rsAhead(ctx,x+5*sc,y+12*sc,90,6,sc); }
  else if(code==="giveway"){ ctx.beginPath();
    ctx.moveTo(x-20*sc,y-13*sc); ctx.lineTo(x+20*sc,y-13*sc); ctx.lineTo(x,y+18*sc); ctx.closePath();
    ctx.fillStyle="#fff"; ctx.fill(); ctx.strokeStyle=RS_RED; ctx.lineWidth=4.2*sc; ctx.stroke(); }
  else if(code==="stops"){ const R=18*sc; ctx.beginPath();
    for(let i=0;i<8;i++){ const a=(Math.PI/8)+(i*Math.PI/4), px=x+R*Math.cos(a), py=y+R*Math.sin(a);
      i?ctx.lineTo(px,py):ctx.moveTo(px,py); } ctx.closePath();
    ctx.fillStyle=RS_RED; ctx.fill();
    ctx.fillStyle="#fff"; ctx.font=`700 ${8.5*sc}px Helvetica`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("STOP",x,y+0.5*sc); }
  else if(code==="noentry"){ ctx.fillStyle=RS_RED; ctx.beginPath(); ctx.arc(x,y,17*sc,0,7); ctx.fill();
    ctx.fillStyle="#fff"; ctx.fillRect(x-10*sc,y-3*sc,20*sc,6*sc); }
  else if(code==="parking"){ const s=16*sc, r=4*sc; ctx.fillStyle=RS_BLUE;
    ctx.beginPath();
    ctx.moveTo(x-s+r,y-s); ctx.arcTo(x+s,y-s,x+s,y+s,r); ctx.arcTo(x+s,y+s,x-s,y+s,r);
    ctx.arcTo(x-s,y+s,x-s,y-s,r); ctx.arcTo(x-s,y-s,x+s,y-s,r); ctx.closePath(); ctx.fill();
    ctx.fillStyle="#fff"; ctx.font=`700 ${23*sc}px Helvetica`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("P",x,y+1*sc); }
  ctx.restore();
}
function drawElements(ctx,els){
  ctx.lineCap="round"; ctx.lineJoin="round";
  for(const e of els){
    ctx.strokeStyle=e.col||INKC; ctx.fillStyle=INKC;
    if(e.k==='l'){ const [x1,y1,x2,y2]=e.p; ctx.lineWidth=e.w;
      if(e.ds) ctx.setLineDash([e.w*1.1,e.w*1.5]);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.setLineDash([]);
      const ang=Math.atan2(x2-x1,y1-y2)*180/Math.PI;
      endcap(ctx,x1,y1,ang+180,e.ss,e.w); endcap(ctx,x2,y2,ang,e.es,e.w);
    } else if(e.k==='q'){ const [x1,y1,cx,cy,x2,y2]=e.p; ctx.lineWidth=e.w;
      if(e.ds) ctx.setLineDash([e.w*1.1,e.w*1.5]);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx,cy,x2,y2); ctx.stroke();
      ctx.setLineDash([]);
      endcap(ctx,x1,y1,Math.atan2(x1-cx,cy-y1)*180/Math.PI,e.ss,e.w);
      endcap(ctx,x2,y2,Math.atan2(x2-cx,cy-y2)*180/Math.PI,e.es,e.w);
    } else if(e.k==='c'){ const [cx,cy,r]=e.p;
      if(e.fill){ ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.fill(); }
      else { ctx.fillStyle="#fff"; ctx.lineWidth=e.w||6; ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.fill(); ctx.stroke(); }
    } else if(e.k==='b'){ const [x,y,w,h]=e.p; ctx.lineWidth=e.w||4; ctx.strokeRect(x,y,w,h); }
    else if(e.k==='s'){ drawStamp(ctx,e.name,e.p[0],e.p[1],e.sc||1); }
    else if(e.k==='t'){ ctx.fillStyle=INKC; ctx.font=`700 ${e.sz||18}px Helvetica`;
      ctx.fillText(e.text||"",e.p[0],e.p[1]); }
    else if(e.k==='i'){
      let img=IMGCACHE[e.data];
      if(!img){ img=new Image(); img.src="data:image/png;base64,"+e.data;
        img.onload=()=>{ if(window.__imgReady) window.__imgReady(); };
        IMGCACHE[e.data]=img; }
      if(img.complete&&img.naturalWidth) ctx.drawImage(img,e.p[0],e.p[1],e.w,e.h); }
  }
}
function armAttach(off,turn,cs,sp){
  /* A point ON the drawn road for a side road at `off` (0 = the junction).
     Sharp (cs 0): entry and exit are straight lines meeting at the centre, so
     the road really passes through the centre. Normal/curvy (cs 1/2): the corner
     is a quadratic curve whose CONTROL point is the centre — the curve itself
     does NOT pass through the centre, so anchoring an arm there leaves it hovering
     off the road. Follow the actual path instead.
     When the exit is jogged sideways, the jog counts as part of the distance along
     the route, so a side road slides entry → jog → exit without jumping. */
  const q = sp || {turn:turn}, s = exitShift(q);
  if(cs===0 || cs===undefined){                           // sharp: entry -> jog -> exit, the jog counting as distance
    const as=Math.abs(s), sg=s<0?-1:1;
    if(off<=0) return [CXX, Math.min(145, CYY-off)];      // back down the entry stem
    if(off<=as) return [CXX+sg*off, CYY];                 // along the sideways jog
    return ray(turn, Math.min(50, off-as), CXX+s, CYY);   // out along the (shifted) exit stem
  }
  const j=cs===2?44:30, [bx0,by0]=exitBase(q);            // where the curve starts/ends (must match the drawing)
  if(off<=-j) return [CXX, Math.min(145, CYY-off)];       // deep on the straight entry stem
  if(off>= j) return ray(turn, Math.min(50, off), bx0, by0);   // out on the straight (shifted) exit stem
  const [A,C1,M,C2,B]=curveS(q,turn,cs);                  // riding the S through the corner
  let t=(off+j)/(2*j), P0,P1,P2;                          // -j..+j  ->  0..1 along the curve
  if(t<0.5){ P0=A; P1=C1; P2=M; t*=2; } else { P0=M; P1=C2; P2=B; t=t*2-1; }
  const mt=1-t;
  return [ mt*mt*P0[0] + 2*mt*t*P1[0] + t*t*P2[0],
           mt*mt*P0[1] + 2*mt*t*P1[1] + t*t*P2[1] ];       // point on the quadratic Bézier
}
/* sp.bend is the CHICANE SHIFT: the exit stem starts a little to the LEFT/RIGHT of where
   the entry meets the line, so the route steps sideways (entry up → short jog → exit up).
   The green centre dot rides this. Capped so it stays a gentle jog, not a dogleg. */
const MAXSHIFT=30;
function exitShift(sp){ return sp.rb ? 0 : Math.max(-MAXSHIFT,Math.min(MAXSHIFT,Math.round(sp.bend||0))); }
/* the exit base: where the exit stem starts — the junction centre, nudged sideways by the shift */
function exitBase(sp){
  const turn=Math.max(-160,Math.min(160,sp.turn==null?0:sp.turn));
  if(sp.rb) return ray(turn,17);
  return [CXX+exitShift(sp), CYY];
}
/* every symbol currently sitting in a corner — the arrow must not run underneath one */
function symbolSpots(sp){
  const out=[];
  if(sp.br) out.push([TW-25,28]);
  if(sp.sign) out.push([TW-25,26]);
  if(sp.warn) out.push([24,22]);
  if(sp.f===1) out.push([TW-25,THh-28]); else if(sp.f===2) out.push([26,THh-28]);
  if(sp.rsign) out.push([28,THh-30]);
  if(sp.corners){ const C={tl:[26,24],tr:[TW-26,26],bl:[26,THh-28],br:[TW-26,THh-28]};
    for(const k in C) if(sp.corners[k]) out.push(C[k]); }
  return out;
}
/* the exit tip: out along the turn FROM the (shifted) base, so the whole exit stem slides with
   the jog. Pulled back if it would run off the canvas or under a corner symbol. */
function exitTipPt(sp){
  const turn=Math.max(-160,Math.min(160,sp.turn==null?0:sp.turn)), [bx,by]=exitBase(sp);
  const dx=Math.sin(turn*Math.PI/180), dy=-Math.cos(turn*Math.PI/180);
  let len=sp.end?52:68;
  const pad=15;                                                  // keep the arrow head on the canvas
  if(dx>1e-3) len=Math.min(len,(TW-pad-bx)/dx); else if(dx<-1e-3) len=Math.min(len,(pad-bx)/dx);
  if(dy>1e-3) len=Math.min(len,(THh-pad-by)/dy); else if(dy<-1e-3) len=Math.min(len,(pad-by)/dy);
  for(const p of symbolSpots(sp)){                               // back off anything already in that corner
    for(let g=0; g<40 && len>28; g++){
      const tx=bx+len*dx, ty=by+len*dy;
      if((tx-p[0])**2+(ty-p[1])**2 >= 26*26) break;
      len-=2;
    }
  }
  len=Math.max(28,len);
  return [bx+len*dx, by+len*dy];
}
/* the curvy corner as a smooth S: [A, ctl1, mid, ctl2, B]. It leaves the entry stem going
   straight up and meets the exit stem dead on, absorbing any sideways jog in between. It's
   the de Casteljau split of the ORIGINAL single corner curve, so with no jog it draws
   exactly the sweep it always did — nothing jumps when the jog starts. */
function curveS(sp,turn,cs){
  const j=cs===2?44:30, [bx0,by0]=exitBase(sp);
  const A=[CXX,CYY+j], B=ray(turn,j,bx0,by0);
  const ux=Math.sin(turn*Math.PI/180), uy=-Math.cos(turn*Math.PI/180);
  const C1=[CXX, CYY+j/2], C2=[B[0]-ux*j/2, B[1]-uy*j/2];
  return [A, C1, [(C1[0]+C2[0])/2,(C1[1]+C2[1])/2], C2, B];
}
/* the straight exit stem [base → tip] */
function exitSegPts(sp){ const [ax,ay]=exitBase(sp), [bx,by]=exitTipPt(sp); return [ax,ay,bx,by]; }
/* where the green centre dot sits: on the exit base */
function exitBendPt(sp){ return exitBase(sp); }
/* the exit road — a plain straight stem (the sideways jog is drawn back at the junction) */
function pushExit(els,ax,ay,bx,by,sp,ds,rc){ els.push({k:'l',p:[ax,ay,bx,by],w:9,ss:0,es:endStyle(sp),ds,col:rc}); }
/* corner shape the quick drawing settles on (matches quickToElements) */
function quickCS(sp){ const turn=Math.max(-160,Math.min(160,sp.turn==null?0:sp.turn));
  return sp.cs===3 ? (Math.abs(turn)>=90?0:Math.abs(turn)<=45?2:1) : (sp.cs===undefined?1:sp.cs); }
/* roundabout outline for a side road's attach: it can ride the entry stem, the ring, or the exit stem.
   off encodes where — |off|<=180 is a ring angle; off>180 runs down the entry stem; off<-180 up the exit stem. */
function armAttachRB(off,turn){
  if(off>180) return ray(180, 17+(off-180));      // down the entry stem (below the ring)
  if(off<-180) return ray(turn, 17+(-180-off));   // out along the exit stem
  return ray(off,17);                             // on the ring at angle `off`
}
function rbNearestOff(x,y,turn){                   // nearest point on that outline → its off code
  let best=0,bd=1e9; const cons=(p,o)=>{ const d=(p[0]-x)**2+(p[1]-y)**2; if(d<bd){bd=d;best=o;} };
  for(let a=-179;a<=180;a+=2) cons(ray(a,17),a);                 // the ring
  for(let r=19;r<=62;r+=2)   cons(ray(180,r),180+(r-17));        // entry stem (straight down)
  for(let r=19;r<=68;r+=2)   cons(ray(turn,r),-180-(r-17));      // exit stem (out along the turn)
  return Math.round(best);
}
/* where a side road's two ends sit: [px,py]=attached end, [tx,ty]=free end. */
function armGeom(sp,m){ const turn=Math.max(-160,Math.min(160,sp.turn==null?0:sp.turn)), cs=quickCS(sp);
  if(sp.rb){ const [px,py]=armAttachRB(m.off,turn), [tx,ty]=ray(m.a,m.len||38,px,py); return {px,py,tx,ty}; }
  const [px,py]=armAttach(m.off,turn,cs,sp), [tx,ty]=ray(m.a,m.len||38,px,py); return {px,py,tx,ty}; }
/* how the route line ends: 0 arrow, 1 flat bar, 2 ball (endcap styles 2/3/1) */
function endStyle(sp){ return sp.end===1?3 : sp.end===2?1 : 2; }
function quickToElements(sp){
  const els=[];
  if(sp.del){ els.push({k:'l',p:[30,30,158,130],w:10,ss:0,es:0},{k:'l',p:[158,30,30,130],w:10,ss:0,es:0}); return els; }
  const turn=Math.max(-160,Math.min(160,sp.turn==null?0:sp.turn));
  const ds=sp.dirt?1:0;
  // VM style (cs:3): auto-pick the corner shape from the angle + draw purple.
  const vm = sp.cs===3;
  const rc = vm ? "#7b2ff2" : undefined;
  const cs = vm ? (Math.abs(turn)>=90?0 : Math.abs(turn)<=45?2 : 1)
                : (sp.cs===undefined?1:sp.cs);
  if(sp.rb){
    const rr=17;
    els.push({k:'c',p:[CXX,CYY,rr],fill:0,w:4,col:rc});
    for(const m of sp.arms){                              // side roads on the roundabout — attach along entry stem / ring / exit stem via `off`
      const [px,py]=armAttachRB(m.off,turn), [ax,ay]=ray(m.a,m.len||38,px,py);
      els.push({k:'l',p:[px,py,ax,ay],w:5,ss:0,es:0});
    }
    const [ex,ey]=ray(180,rr);
    els.push({k:'l',p:[EX,EY,ex,ey],w:9,ss:1,es:0,ds,col:rc});
    const arc=(((sp.rbu?turn+180:180-turn)%360)+360)%360||360;
    const sgn=sp.rbu?1:-1, steps=Math.max(3,Math.round(arc/25));
    for(let i=0;i<steps;i++){
      const [ax,ay]=ray(180+sgn*arc*i/steps,rr), [bx,by]=ray(180+sgn*arc*(i+1)/steps,rr);
      els.push({k:'l',p:[ax,ay,bx,by],w:9,ss:0,es:0,col:rc});
    }
    const [rx,ry]=ray(turn,rr), [ox,oy]=ray(turn,sp.end?52:68);
    pushExit(els,rx,ry,ox,oy,sp,ds,rc);
  } else {
    for(const m of sp.arms){                              // every side road always draws — never hidden by the main route
      const [px,py]=armAttach(m.off,turn,cs,sp);
      const [ax,ay]=ray(m.a,m.len||38,px,py);             // len: draggable reach (38 = default stub)
      els.push({k:'l',p:[px,py,ax,ay],w:5,ss:0,es:0});
    }
    const shift=exitShift(sp), [bx0,by0]=exitBase(sp), [endx,endy]=exitTipPt(sp), es=endStyle(sp);
    if(cs===0){                                    // sharp: hard corners — entry up, sideways jog, exit up
      els.push({k:'l',p:[EX,EY,CXX,CYY],w:9,ss:1,es:0,ds,col:rc});
      if(shift) els.push({k:'l',p:[CXX,CYY,bx0,by0],w:9,ss:0,es:0,ds,col:rc});
      els.push({k:'l',p:[bx0,by0,endx,endy],w:9,ss:0,es,ds,col:rc});
    } else {                                       // curvy: ONE generous corner, split into a smooth S
      const [A,C1,M,C2,B]=curveS(sp,turn,cs);      // at zero jog this is the identical curve, so nothing jumps
      els.push({k:'l',p:[EX,EY,A[0],A[1]],w:9,ss:1,es:0,ds,col:rc});
      els.push({k:'q',p:[A[0],A[1],C1[0],C1[1],M[0],M[1]],w:9,ss:0,es:0,ds,col:rc});
      els.push({k:'q',p:[M[0],M[1],C2[0],C2[1],B[0],B[1]],w:9,ss:0,es:0,ds,col:rc});
      els.push({k:'l',p:[B[0],B[1],endx,endy],w:9,ss:0,es,ds,col:rc});
    }
  }
  if(sp.lc) els.push({k:'s',name:'lc',p:[CXX,CYY+40],sc:1});
  if(sp.br) els.push({k:'s',name:'br',p:[TW-25,28],sc:1});
  if(sp.f===1) els.push({k:'s',name:'pump',p:[TW-25,THh-28],sc:1});      // bottom-right
  else if(sp.f===2) els.push({k:'s',name:'pump',p:[26,THh-28],sc:1});    // bottom-left
  if(sp.warn===1) els.push({k:'s',name:'warn',p:[24,22],sc:1});          // orange, top-left
  else if(sp.warn===2) els.push({k:'s',name:'warnr',p:[24,22],sc:1});    // red, top-left
  if(sp.sign) els.push({k:'s',name: sp.sign==="nat"?"natl":"sl"+sp.sign, p:[TW-25,26], sc:1}); // top-right
  if(sp.rsign) els.push({k:'s',name:'rs_'+sp.rsign, p:[28, THh-30], sc:1});   // road sign, bottom-left
  if(sp.corners){                                    // per-corner symbols (click a corner to fill it)
    const CPOS={tl:[26,24], tr:[TW-26,26], bl:[26,THh-28], br:[TW-26,THh-28]};
    for(const k in CPOS) if(sp.corners[k]) els.push({k:'s',name:sp.corners[k], p:CPOS[k], sc:1});
  }
  return els;
}
function drawQuick(ctx,sp){ drawElements(ctx,quickToElements(sp)); }
