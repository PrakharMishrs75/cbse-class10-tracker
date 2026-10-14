window.CLERK_APPEARANCE={variables:{colorPrimary:"#0d59af",borderRadius:"12px",fontFamily:"Open Sans, sans-serif"},elements:{rootBox:{width:"100%"},cardBox:{boxShadow:"none",width:"100%"},card:{boxShadow:"none",border:"0",padding:"0",width:"100%",background:"transparent"}}};
window.startDashboard = async function(){
  const authScreen=document.getElementById("authScreen");
  const appShell=document.getElementById("appShell");
  const clerk=window.Clerk;
  if (!clerk) {
    document.getElementById("clerkAuth").innerHTML='<p class="formerr">Sign in could not load. Please reload the page.</p>';
    return;
  }
  if (!clerk.isSignedIn) {
    appShell.classList.remove("ready");
    const appUrl = window.location.origin + window.location.pathname;
    // GitHub Pages is hosted under /cbse-class10-tracker/.
    // Keep sign-in and sign-up as two real Clerk routes. Previously both
    // signUpUrl and signInUrl pointed to the same page, so clicking
    // "Sign up" simply mounted the sign-in screen again.
    const signInUrl = appUrl + "#/sign-in";
    const signUpUrl = appUrl + "#/sign-up";
    const authBox = document.getElementById("clerkAuth");

    const mountAuth = () => {
      if (!window.Clerk || window.Clerk.isSignedIn) return;
      try { window.Clerk.unmountSignIn(authBox); } catch (_) {}
      try { window.Clerk.unmountSignUp(authBox); } catch (_) {}
      authBox.innerHTML = "";

      const isSignUp = window.location.hash.toLowerCase().startsWith("#/sign-up");
      if (isSignUp) {
        clerk.mountSignUp(authBox, {
          routing: "hash",
          appearance: window.CLERK_APPEARANCE,
          signInUrl,
          forceRedirectUrl: appUrl,
          fallbackRedirectUrl: appUrl
        });
      } else {
        clerk.mountSignIn(authBox, {
          routing: "hash",
          appearance: window.CLERK_APPEARANCE,
          signUpUrl,
          forceRedirectUrl: appUrl,
          fallbackRedirectUrl: appUrl
        });
      }
    };

    mountAuth();
    window.addEventListener("hashchange", mountAuth);
    clerk.addListener(() => { if (clerk.isSignedIn) location.reload(); });
    return;
  }
  authScreen.style.display = "none";
  appShell.classList.add("ready");

const syllabus={
"Mathematics":["Real Numbers","Polynomials","Pair of Linear Equations","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry","Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes","Statistics","Probability"],
"Science":["Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and Its Compounds","Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity","Light – Reflection and Refraction","Human Eye and Colourful World","Electricity","Magnetic Effects of Electric Current","Our Environment"],
"Social Science":["Rise of Nationalism in Europe","Nationalism in India","Making of a Global World","Age of Industrialisation","Print Culture and Modern World","Resources and Development","Forest and Wildlife Resources","Water Resources","Agriculture","Manufacturing Industries","Power Sharing","Federalism","Gender, Religion and Caste","Political Parties","Outcomes of Democracy","Development","Sectors of Indian Economy","Money and Credit","Globalisation","Consumer Rights","Minerals and Energy Resources","Lifelines of National Economy"],
"English":["A Letter to God","Nelson Mandela","Two Stories About Flying","Diary of Anne Frank","Glimpses of India","Mijbil the Otter","Madam Rides the Bus","Sermon at Benares","The Proposal","Dust of Snow","Fire and Ice","A Tiger in the Zoo","How to Tell Wild Animals","The Ball Poem","Amanda!","The Trees","Fog","Custard the Dragon","For Anne Gregory","A Triumph of Surgery","The Thief's Story","The Midnight Visitor","A Question of Trust","Footprints Without Feet","The Making of a Scientist","The Necklace","Bholi","The Book That Saved the Earth"],
"Hindi Course B":["साखी — कबीर","पद — मीरा","मनुष्यता — मैथिलीशरण गुप्त","पर्वत प्रदेश में पावस — सुमित्रानंदन पंत","तोप — वीरेन डंगवाल","कर चले हम फ़िदा — कैफ़ी आज़मी","आत्मत्राण — रवींद्रनाथ ठाकुर","बड़े भाई साहब — प्रेमचंद","डायरी का एक पन्ना — सीताराम सेकसरिया","तताँरा-वामीरो कथा — लीलाधर मंडलोई","तीसरी कसम के शिल्पकार शैलेंद्र — प्रहलाद अग्रवाल","अब कहाँ दूसरे के दुख से दुखी होने वाले — निदा फ़ाज़ली","पतझर में टूटी पत्तियाँ — रवींद्र केलेकर","कारतूस — हबीब तनवीर","हरिहर काका — मिथिलेश्वर","सपनों के-से दिन — गुरदयाल सिंह","टोपी शुक्ला — राही मासूम रज़ा"],
"Information Technology":["Communication Skills-II","Self-Management Skills-II","ICT Skills-II","Entrepreneurial Skills-II","Green Skills-II","Digital Documentation (Advanced)","Electronic Spreadsheet (Advanced)","Database Management System","Healthy, Safe and Secure Working Environment"]
};
const UID=clerk.user?.id||"guest", SKEY="cbsePro:"+UID, PKEY="cbsePlanner:"+UID;
// Data used to be shared by everyone on this browser; give it to the first account that signs in, then scope per user.
if(!localStorage.getItem(SKEY)&&localStorage.getItem("cbsePro")&&!localStorage.getItem("cbseLegacyClaimed")){localStorage.setItem(SKEY,localStorage.getItem("cbsePro"));localStorage.setItem("cbseLegacyClaimed",UID);const lp=localStorage.getItem("cbseAIPlanner");if(lp)localStorage.setItem(PKEY,lp)}
let s;try{s=JSON.parse(localStorage.getItem(SKEY)||"null")}catch(e){s=null}
s=s&&typeof s==="object"?s:{};s.done=s.done||{};s.marks=s.marks||[];s.revision=s.revision||{};s.events=s.events||{};
const expandedSubs=new Set([Object.keys(syllabus)[0]]);
s.tests=s.tests||[];s.hist=s.hist||{};
const SHORT={"Mathematics":"Maths","Social Science":"SST","Hindi Course B":"Hindi","Information Technology":"IT"},COLORS=["#0d59af","#10b5a5","#e23b2e","#e0a100","#e0489b","#3b8cf0","#8a5cf6"];
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function greet(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening"}
let profile=(function(){
 const u=clerk.user;
 const meta=u?.unsafeMetadata||{};
 return (u?.fullName||u?.firstName||meta.name)?{name:u.fullName||u.firstName||meta.name,class:String(meta.class||"10")} : null;
})();
const $=x=>document.querySelector(x), $$=x=>document.querySelectorAll(x);
const key=(sub,i)=>sub+"::"+i;
function total(){return Object.values(syllabus).reduce((n,a)=>n+a.length,0)}
function done(){return Object.entries(syllabus).reduce((n,[sub,a])=>n+a.filter((_,i)=>s.done[key(sub,i)]).length,0)}
function save(){s.hist[localDateString()]=Math.round(done()/total()*100);localStorage.setItem(SKEY,JSON.stringify(s));render()}
function pct(sub){return Math.round(syllabus[sub].filter((_,i)=>s.done[key(sub,i)]).length/syllabus[sub].length*100)}
function initials(name){
 const parts=String(name||"Student").trim().split(/\s+/).filter(Boolean);
 return (parts.length>1?parts[0][0]+parts[parts.length-1][0]:parts[0][0]).toUpperCase().slice(0,2);
}
function updateProfileUI(){
 const name=profile?.name||"Student";
 const cls=profile?.class||"10";
 $("#profileBtn").textContent=initials(name);
 $("#title").textContent=`${greet()}, ${name}`;
 $("#classLabel").textContent=cls;$("#menuName").textContent=name;$("#menuEmail").textContent=clerk.user?.primaryEmailAddress?.emailAddress||"";
 $("#profileBtn").title=`${name} • Class ${cls}`;
}
function openProfile(force=false){
 const modal=$("#profileModal");
 if(!modal)return;
 $("#studentName").value=profile?.name||"";
 $("#studentClass").value=profile?.class||"10";
 $("#profileError").textContent="";
 modal.classList.add("show"); modal.setAttribute("aria-hidden","false");
 $("#cancelProfile").hidden=!profile;
 setTimeout(()=>$("#studentName").focus(),50);
}
function closeProfile(){
 const modal=$("#profileModal");
 modal.classList.remove("show"); modal.setAttribute("aria-hidden","true");
}
async function saveProfile(){
 const name=$("#studentName").value.trim();
 if(!name){$("#profileError").textContent="Please enter your name.";return;}
 profile={name,class:$("#studentClass").value};
 $("#profileError").textContent="Saving…";
 try{
   await clerk.user.update({firstName:name,unsafeMetadata:{...(clerk.user.unsafeMetadata||{}),class:profile.class,name}});
   profile={name:clerk.user.fullName||name,class:profile.class};
   updateProfileUI(); closeProfile();
 }catch(e){
   $("#profileError").textContent="Could not save your profile. Check your connection and try again.";
 }
}

function localDateString(d=new Date()){
 const x=new Date(d); x.setHours(0,0,0,0);
 return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
}
function setupPlanner(){
 const subj=$('#pSubject'); if(!subj) return;
 subj.innerHTML='<option value="">Choose a subject</option>'+Object.keys(syllabus).map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
 let saved=null;
 try{ saved=JSON.parse(localStorage.getItem(PKEY)||'null'); }catch(e){ localStorage.removeItem(PKEY); }
 if(saved){
   ['pDate','pTarget','pHours','pLevel','pSubject','pWeak'].forEach(id=>{if(saved[id]!==undefined && $('#'+id)) $('#'+id).value=saved[id]});
   if(saved.planHtml){ $('#planOutput').innerHTML=saved.planHtml; $('#planSummary').textContent=saved.summary||'Saved plan'; }
 }
 const today=localDateString();
 $('#pDate').min=today;
 if(!$('#pDate').value){ const d=new Date(); d.setDate(d.getDate()+7); $('#pDate').value=localDateString(d); }
 const chaptersBox=$('#plannerChapters'), chaptersInput=$('#pChapters');
 function selectedChapters(){return [...chaptersBox.querySelectorAll('input[data-planner-chapter]:checked')].map(x=>x.value);}
 function renderPlannerChapters(keep=true){
   const subject=subj.value, all=syllabus[subject]||[];
   if(!subject){chaptersBox.innerHTML='<span class="planner-placeholder">Choose a subject to see its chapters.</span>'; chaptersInput.value=''; return;}
   const old=keep?new Set((chaptersInput.value||'').split(',').map(x=>x.trim()).filter(Boolean)):new Set();
   const incomplete=new Set(incompleteChapters(subject));
   chaptersBox.innerHTML=all.map((ch,i)=>{
     const checked=old.size?old.has(ch):false;
     const doneClass=s.done[key(subject,i)]?' is-done':'';
     return `<label class="planner-chapter${doneClass}"><input type="checkbox" data-planner-chapter value="${esc(ch)}" ${checked?'checked':''}><span>${esc(ch)}</span>${s.done[key(subject,i)]?'<small>Done</small>':''}</label>`;
   }).join('');
   syncChapterText();
 }
 function syncChapterText(){chaptersInput.value=selectedChapters().join(', ');}
 function dashboardInsight(subject){
   const arr=syllabus[subject]||[], completed=arr.filter((_,i)=>s.done[key(subject,i)]).length;
   const subjectMarks=(s.marks||[]).filter(m=>String(m.subject).toLowerCase()===subject.toLowerCase());
   const avg=subjectMarks.length?Math.round(subjectMarks.reduce((a,m)=>a+(m.score/Math.max(1,m.total)*100),0)/subjectMarks.length):null;
   return {completed,totalCh:arr.length,incomplete:incompleteChapters(subject),avg};
 }
 function syncFromDashboard(){
   const subject=subj.value;if(!subject)return;
   const info=dashboardInsight(subject);
   renderPlannerChapters(false);
   if(info.avg!==null){
     $('#pTarget').value=Math.max(60,Math.min(95,Math.round(info.avg+10)));
     $('#pLevel').value=info.avg<50?'weak':info.avg<75?'average':'strong';
   }
   if(!$('#pWeak').value.trim()&&info.avg!==null) $('#pWeak').value=info.avg<60?'Focus on concepts, formulas and basic questions':info.avg<80?'Focus on mistakes, competency questions and timed practice':'Focus on timed practice, case-based questions and final revision';
   $('#plannerSyncNote').innerHTML=`Synced with dashboard: <b>${info.completed}/${info.totalCh}</b> chapters complete${info.avg!==null?` • latest average <b>${info.avg}%</b>`:''}`;
 }
 function refreshStats(){
   const hours=Math.max(.5,Math.min(12,+$('#pHours').value||0)), date=$('#pDate').value;
   const days=date?dateDiff(date,today):0;
   $('#plannerDays').textContent=days>0?days:'—'; $('#plannerHours').textContent=hours?hours+'h':'—';
   const readiness=[date,subj.value,$('#pHours').value,$('#pTarget').value].filter(Boolean).length;
   const r=Math.round(readiness/4*100); $('#planReadiness').textContent=r+'%'; $('#planReadinessBar').style.width=r+'%';
 }
 chaptersBox.addEventListener('change',syncChapterText);
 subj.addEventListener('change',()=>{renderPlannerChapters(false);syncFromDashboard();refreshStats();});
 ['pDate','pHours','pTarget'].forEach(id=>$('#'+id)?.addEventListener('input',refreshStats));
 $('#syncPlanner').onclick=()=>{syncFromDashboard();refreshStats();};
 $('#generatePlan').onclick=generatePlan;
 $('#clearPlan').onclick=()=>{localStorage.removeItem(PKEY); $('#planOutput').innerHTML='<div class="empty-plan"><b>No plan yet</b><p>Choose a subject, select chapters and generate your plan.</p></div>'; $('#planSummary').textContent='Your plan will appear here.'; $('#plannerSyncNote').textContent='Not synced yet'; refreshStats();};
 if(subj.value){renderPlannerChapters(true);syncFromDashboard();} else renderPlannerChapters(false);
 refreshStats();
}

function dateDiff(a,b){return Math.max(0,Math.ceil((new Date(a+'T00:00:00')-new Date(b+'T00:00:00'))/86400000));}
function formatDate(d){return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});}
function incompleteChapters(subject){return (syllabus[subject]||[]).filter((_,i)=>!s.done[key(subject,i)]);}
function generatePlan(){
 const subject=$('#pSubject').value, testDate=$('#pDate').value;
 const hours=Math.min(12,Math.max(.5,+$('#pHours').value||0));
 const target=Math.min(100,Math.max(1,+$('#pTarget').value||80));
 const level=$('#pLevel').value, weak=$('#pWeak').value.trim();
 if(!subject||!testDate||!hours){alert('Please choose the test date, subject and study hours.');return;}
 const today=localDateString(), days=dateDiff(testDate,today);
 if(days<1){alert('Please choose a test date at least 1 day from today.');return;}
 const chosen=($('#pChapters').value||'').split(',').map(x=>x.trim()).filter(Boolean);
 const chapters=chosen.length?chosen:incompleteChapters(subject);
 const finalChapters=chapters.length?chapters:[subject+' revision'];
 const marks=(s.marks||[]).filter(m=>String(m.subject).toLowerCase()===subject.toLowerCase());
 const avg=marks.length?Math.round(marks.reduce((a,m)=>a+(m.score/Math.max(1,m.total)*100),0)/marks.length):null;
 const priorities=weak.toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
 const weighted=finalChapters.map((ch,i)=>({ch,weight:priorities.some(w=>ch.toLowerCase().includes(w))?3:1}));
 const plan=[]; let cursor=0;
 for(let day=0;day<days;day++){
   const d=new Date();d.setDate(d.getDate()+day);
   const isLast=day===days-1, isPractice=day>=Math.max(0,Math.floor(days*.45));
   const slots=isLast?weighted.length:Math.max(1,Math.ceil(weighted.length/Math.max(1,Math.ceil(days*.6))));
   const focus=[]; for(let k=0;k<slots&&cursor<weighted.length;k++)focus.push(weighted[cursor++].ch);
   if(!focus.length)focus.push(...finalChapters.slice(0,Math.min(2,finalChapters.length)));
   let learn,practice,revision;
   if(isLast){learn=.25;practice=Math.max(.5,hours*.55);revision=Math.max(.25,hours-learn-practice);}
   else if(!isPractice){learn=hours*(level==='weak'?.55:level==='average'?.45:.35);practice=hours*.30;revision=hours-learn-practice;}
   else{learn=hours*.20;practice=hours*(level==='strong'?.55:.50);revision=hours-learn-practice;}
   const round=q=>Math.max(.25,Math.round(q*4)/4);
   learn=round(learn);practice=round(practice);revision=round(Math.max(.25,hours-learn-practice));
   let total=learn+practice+revision;
   if(total>hours){revision=round(Math.max(.25,hours-learn-practice));total=learn+practice+revision;if(total>hours)practice=round(Math.max(.25,hours-learn-practice-revision));}
   plan.push({d,focus,learn,practice,revision,isLast,isPractice});
 }
 const syncLine=`Synced from syllabus: ${done()}/${total()} total chapters complete.${avg!==null?` ${subject} average: ${avg}%.`:''}`;
 const html=plan.map((x,i)=>`<article class="plan-day ${x.isLast?'exam-eve':''}"><div class="plan-day-head"><span class="plan-day-num">${i+1}</span><div><b>${formatDate(x.d)}</b><small>${x.isLast?'Final revision and mock test':x.isPractice?'Practice phase':'Learning phase'}</small></div></div><div class="plan-focus"><b>Focus:</b> ${x.focus.map(esc).join(', ')}</div><div class="plan-blocks"><span>Learn ${x.learn}h</span><span>Practice ${x.practice}h</span><span>Revise ${x.revision}h</span></div></article>`).join('');
 const summary=`${subject} • ${days} day${days===1?'':'s'} • ${hours}h/day • Target ${target}%`;
 $('#planSummary').textContent=summary; $('#planOutput').innerHTML=`<div class="plan-intro"><b>${summary}</b><p>${esc(syncLine)} ${weak?`Priority: ${esc(weak)}.`:'Planner prioritised the chapters you selected.'}</p></div>${html}`;
 $('#plannerSyncNote').innerHTML=`Plan created for <b>${finalChapters.length}</b> chapter${finalChapters.length===1?'':'s'} across <b>${days}</b> day${days===1?'':'s'}.`;
 localStorage.setItem(PKEY,JSON.stringify({pDate:testDate,pTarget:target,pHours:hours,pLevel:level,pSubject:subject,pChapters:finalChapters.join(', '),pWeak:weak,planHtml:$('#planOutput').innerHTML,summary}));
}

function render(){
 const d=done(),t=total(),p=Math.round(d/t*100),marks=s.marks;
 $("#done").textContent=d;$("#left").textContent=t-d;$("#overall").textContent=p+"%";$("#avg").textContent=(marks.length?Math.round(marks.reduce((a,m)=>a+m.score/m.total*100,0)/marks.length):0)+"%";$(".circle").style.setProperty("--p",p+"%");
 $(".big-progress").title=`${d} of ${t} chapters complete`;
 $("#subjectProgress").innerHTML=Object.keys(syllabus).map(x=>`<button type="button" class="progressitem subject-jump" data-subject-jump="${esc(x)}" title="Open all ${syllabus[x].length} chapters of ${esc(x)}"><div class="row"><span>${esc(x)}</span><b>${pct(x)}%</b></div><div class="bar"><div class="fill" style="width:${pct(x)}%;--c:${COLORS[Object.keys(syllabus).indexOf(x)%7]};--c2:${COLORS[(Object.keys(syllabus).indexOf(x)+1)%7]}"></div></div><small>${syllabus[x].length} chapters • Click to view all</small></button>`).join("");
 $$("[data-subject-jump]").forEach(el=>el.onclick=()=>openSubject(el.dataset.subjectJump));
 $("#marksMini").innerHTML=marks.length?marks.slice(-5).reverse().map(m=>`<div class="minirow"><span>${esc(m.subject)}</span><span>${esc(m.test)}</span><b class="score">${Math.round(m.score/m.total*100)}%</b></div>`).join(""):"<p style='color:var(--muted)'>No marks yet. Add your first test.</p>";
 renderSyllabus();renderMarks();renderRevision();renderCalendar();renderCharts();renderTests();
}
function openSubject(subject){
 if(!syllabus[subject]) return;
 page("subjects");
 if($("#search")) $("#search").value="";
 expandedSubs.add(subject);
 renderSyllabus();
 const card=document.querySelector(`[data-subject-card="${CSS.escape(subject)}"]`);
 if(card){
   card.scrollIntoView({behavior:"smooth",block:"start"});
   card.classList.add("subject-highlight");
   setTimeout(()=>card.classList.remove("subject-highlight"),1200);
 }
}

function renderSyllabus(){
 let q=($("#search")?.value||"").toLowerCase();
 $("#syllabus").innerHTML=Object.entries(syllabus).map(([sub,a])=>{
   let items=a.map((c,i)=>({c,i})).filter(x=>x.c.toLowerCase().includes(q));
   if(!items.length)return "";
   let d=pct(sub);
   const isOpen=!!q||expandedSubs.has(sub);
   return `<div class="panel subjectbox ${isOpen?'expanded':''}" data-subject-card="${esc(sub)}">
     <button type="button" class="subjecttop subject-toggle" data-subject-toggle="${esc(sub)}" aria-expanded="${isOpen}">
       <span><h3>${esc(sub)}</h3><small>${a.length} chapters • ${a.filter((_,i)=>s.done[key(sub,i)]).length} completed</small></span>
       <span class="subject-actions"><span class="pill">${d}% complete</span><span class="toggle-icon">${isOpen?'−':'+'}</span></span>
     </button>
     <div class="chapters" ${isOpen?'':'hidden'}>${items.map(x=>`<label class="chapter ${s.done[key(sub,x.i)]?'done':''}"><input type="checkbox" data-sub="${esc(sub)}" data-i="${x.i}" ${s.done[key(sub,x.i)]?'checked':''}><span>${esc(x.c)}</span></label>`).join("")}</div>
   </div>`;
 }).join("");

 $$("[data-subject-toggle]").forEach(btn=>btn.onclick=()=>{
   const card=btn.closest(".subjectbox"), chapters=card.querySelector(".chapters");
   const open=btn.getAttribute("aria-expanded")==="true";
   if(open)expandedSubs.delete(btn.dataset.subjectToggle);else expandedSubs.add(btn.dataset.subjectToggle);
   btn.setAttribute("aria-expanded",String(!open));
   card.classList.toggle("expanded",!open);
   chapters.hidden=open;
   btn.querySelector(".toggle-icon").textContent=open?"+":"−";
 });

 $$("[data-sub]").forEach(el=>el.onchange=()=>{
   s.done[key(el.dataset.sub,el.dataset.i)]=el.checked;
   if(el.checked)s.revision[key(el.dataset.sub,el.dataset.i)]={date:new Date().toLocaleDateString(),level:"Due today"};
   save();
 });
}
function renderCharts(){
 const subs=Object.keys(syllabus),n=subs.length,W=560,bw=46,gap=(W-40-n*bw)/(n-1);
 $("#chartBars").innerHTML=`<svg viewBox="0 0 ${W} 235" role="img" aria-label="Completion by subject"><defs>${subs.map((x,i)=>`<linearGradient id="g${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${COLORS[i%7]}"/><stop offset="1" stop-color="${COLORS[(i+1)%7]}"/></linearGradient>`).join("")}</defs>`+subs.map((x,i)=>{const p=pct(x),h=Math.max(p*1.6,p?4:0),xx=20+i*(bw+gap);return `<rect class="trk" x="${xx}" y="30" width="${bw}" height="160" rx="12"/><rect x="${xx}" y="${190-h}" width="${bw}" height="${h}" rx="12" fill="url(#g${i})"/><text class="pv" x="${xx+bw/2}" y="${Math.min(186-h,178)-4}" text-anchor="middle">${p}%</text><text x="${xx+bw/2}" y="212" text-anchor="middle">${esc(SHORT[x]||x)}</text><text x="${xx+bw/2}" y="227" text-anchor="middle" style="font-size:9px">${syllabus[x].filter((_,j)=>s.done[key(x,j)]).length}/${syllabus[x].length}</text>`}).join("")+"</svg>";
 const ks=Object.keys(s.hist).sort().slice(-14);
 if(ks.length<2){$("#chartTrend").innerHTML='<div class="chartnote">Tick off chapters on two different days to see your trend line.</div>';return}
 const pts=ks.map((k,i)=>[20+i*(320/(ks.length-1)),170-s.hist[k]*1.4]),line=pts.map(p=>p.join(",")).join(" ");
 $("#chartTrend").innerHTML=`<svg viewBox="0 0 360 215"><defs><linearGradient id="ta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d59af" stop-opacity=".35"/><stop offset="1" stop-color="#0d59af" stop-opacity="0"/></linearGradient></defs>${[0,50,100].map(v=>`<line x1="20" x2="340" y1="${170-v*1.4}" y2="${170-v*1.4}" stroke="#8883" stroke-dasharray="3 4"/><text x="0" y="${174-v*1.4}" style="font-size:9px">${v}</text>`).join("")}<polygon points="20,170 ${line} 340,170" fill="url(#ta)"/><polyline points="${line}" fill="none" stroke="#0d59af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#fff" stroke="#0d59af" stroke-width="2.5"/>`).join("")}<text x="20" y="195">${ks[0].slice(5)}</text><text x="340" y="195" text-anchor="end">${ks[ks.length-1].slice(5)}</text></svg>`;
}
function testStats(t){let tot=0,dn=0;const parts=Object.entries(t.sel).filter(([sub])=>syllabus[sub]).map(([sub,ix])=>{const d=ix.filter(i=>s.done[key(sub,i)]).length;tot+=ix.length;dn+=d;return {sub,n:ix.length,d}});return {tot,dn,parts,p:tot?Math.round(dn/tot*100):0}}
function renderTests(){
 const today=localDateString(),list=[...s.tests].sort((a,b)=>a.date.localeCompare(b.date));
 const next=list.find(t=>t.date>=today);
 $("#nextTest").textContent=next?(dateDiff(next.date,today)===0?"Today":dateDiff(next.date,today)+" days"):"—";
 $("#nextTestLbl").textContent=next?next.name:"No test scheduled";
 $("#tList").innerHTML=list.length?list.map(t=>{const st=testStats(t),dl=dateDiff(t.date,today),past=t.date<today;
  return `<div class="tcard"><div class="thead"><div><h3>${esc(t.name)}</h3><small>${new Date(t.date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</small></div><div class="tdays ${past?"past":dl<=3?"soon":""}">${past?"Done":dl===0?"Today":dl}<small>${past||dl===0?"":"days left"}</small></div></div>
  <div class="tchips">${st.parts.map(x=>`<span>${esc(SHORT[x.sub]||x.sub)} • ${x.n} ch</span>`).join("")}</div>
  <div class="row" style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:7px"><span>Syllabus ready</span><b>${st.p}% (${st.dn}/${st.tot})</b></div><div class="bar"><div class="fill" style="width:${st.p}%"></div></div>
  <div class="tfoot"><small style="color:var(--muted)">${st.tot-st.dn} chapter${st.tot-st.dn===1?"":"s"} still to finish</small><span><button data-tplan="${t.id}">Plan this test</button> <button class="del" data-tdel="${t.id}">Delete</button></span></div></div>`}).join(""):'<div class="panel"><b>No tests yet.</b><p style="color:var(--muted)">Choose a date and syllabus on the left to schedule your first test.</p></div>';
 $$("[data-tdel]").forEach(b=>b.onclick=()=>{s.tests=s.tests.filter(t=>t.id!==b.dataset.tdel);save()});
 $$("[data-tplan]").forEach(b=>b.onclick=()=>{const t=s.tests.find(x=>x.id===b.dataset.tplan),sub=Object.keys(t.sel)[0];page("planner");$("#pDate").value=t.date;$("#pSubject").value=sub;$("#pSubject").dispatchEvent(new Event("change"));$("#pDate").value=t.date;$("#pDate").dispatchEvent(new Event("input"))});
}
function setupTests(){
 const box=$("#tPicker");
 box.innerHTML=Object.entries(syllabus).map(([sub,a])=>`<details class="tp"><summary><b>${esc(sub)}</b><span class="pill" data-cnt="${esc(sub)}">0 selected</span></summary><label class="tpall"><input type="checkbox" data-all="${esc(sub)}"> Select all ${a.length} chapters</label><div class="tpchs">${a.map((c,i)=>`<label class="chapter"><input type="checkbox" data-tsub="${esc(sub)}" data-i="${i}"><span>${esc(c)}</span></label>`).join("")}</div></details>`).join("");
 const count=sub=>{const c=box.querySelectorAll(`[data-tsub="${CSS.escape(sub)}"]:checked`).length;box.querySelector(`[data-cnt="${CSS.escape(sub)}"]`).textContent=c+" selected"};
 box.addEventListener("change",e=>{const el=e.target;if(el.dataset.all){box.querySelectorAll(`[data-tsub="${CSS.escape(el.dataset.all)}"]`).forEach(x=>x.checked=el.checked);count(el.dataset.all)}else if(el.dataset.tsub)count(el.dataset.tsub)});
 $("#tDate").min=localDateString();
 $("#tSave").onclick=()=>{const name=$("#tName").value.trim(),date=$("#tDate").value,sel={};
  box.querySelectorAll("[data-tsub]:checked").forEach(x=>{(sel[x.dataset.tsub]=sel[x.dataset.tsub]||[]).push(+x.dataset.i)});
  const err=m=>$("#tErr").textContent=m;
  if(!name)return err("Give your test a name.");if(!date)return err("Choose the test date.");if(!Object.keys(sel).length)return err("Select at least one chapter.");
  err("");s.tests.push({id:String(Date.now()),name,date,sel});$("#tName").value="";$("#tDate").value="";box.querySelectorAll("input:checked").forEach(x=>x.checked=false);box.querySelectorAll("[data-cnt]").forEach(x=>x.textContent="0 selected");save()};
}
function renderMarks(){
 const box=$("#marksTable");if(!s.marks.length){box.innerHTML="<p style='color:var(--muted)'>No results recorded.</p>";return}
 box.innerHTML=`<div class="tablehead"><span>Subject</span><span>Test</span><span>Score</span><span></span></div>`+s.marks.map((m,i)=>`<div class="markrow"><span>${esc(m.subject)}</span><span>${esc(m.test)}</span><b>${m.score}/${m.total}</b><button class="del" data-del="${i}" aria-label="Delete result">×</button></div>`).join("");
$$("[data-del]").forEach(b=>b.onclick=()=>{s.marks.splice(+b.dataset.del,1);save()})
}
function renderRevision(){
 let items=[];Object.entries(s.revision).forEach(([k,v])=>{let [sub,i]=k.split("::");if(s.done[k])items.push({k,sub,name:syllabus[sub][i],...v})});
 $("#revisionList").innerHTML=items.length?items.map(x=>`<div class="rev"><div class="revtop"><b>${esc(x.name)}</b><span class="pill">${esc(x.level||"Due today")}</span></div><small>${esc(x.sub)} • Last completed ${esc(x.date)}</small><button data-rev="${x.k}">Mark revised ✓</button></div>`).join(""):"<div class='panel'><b>No revision items yet.</b><p style='color:var(--muted)'>Complete a chapter and it will appear here.</p></div>";
$$("[data-rev]").forEach(b=>b.onclick=()=>{s.revision[b.dataset.rev]={date:new Date().toLocaleDateString(),level:"Revised"};save()})
}
let cur=new Date();
function renderCalendar(){
 $("#month").textContent=cur.toLocaleString("en-IN",{month:"long",year:"numeric"});
 let y=cur.getFullYear(),m=cur.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),out="";
 for(let i=0;i<first;i++)out+="<div class='day muted'></div>";
 for(let d=1;d<=days;d++){let date=new Date(y,m,d),id=localDateString(date),today=localDateString(),T=s.tests.filter(t=>t.date===id);out+=`<div class="day ${id===today?'today':''} ${s.events[id]?'has':''} ${T.length?'test':''}" data-date="${id}"><b>${d}</b>${s.events[id]?`<div class='dot'></div><div class='dtask'>${esc(s.events[id])}</div>`:""}${T.map(t=>`<div class='tt'>${esc(t.name)}</div>`).join("")}</div>`}
 $("#days").innerHTML=out;$$("[data-date]").forEach(el=>el.onclick=()=>openTask(el.dataset.date))
}
let taskDate=null;
function openTask(id){taskDate=id;$("#taskDateLbl").textContent=new Date(id+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("#taskText").value=s.events[id]||"";$("#taskDelete").hidden=!s.events[id];const m=$("#taskModal");m.classList.add("show");m.setAttribute("aria-hidden","false");setTimeout(()=>$("#taskText").focus(),50)}
function closeTask(){const m=$("#taskModal");m.classList.remove("show");m.setAttribute("aria-hidden","true");taskDate=null}
$("#taskSave").onclick=()=>{const v=$("#taskText").value.trim();if(taskDate){if(v)s.events[taskDate]=v;else delete s.events[taskDate]}closeTask();save()};
$("#taskDelete").onclick=()=>{if(taskDate)delete s.events[taskDate];closeTask();save()};
$("#taskCancel").onclick=closeTask;
$("#taskText").addEventListener("keydown",e=>{if(e.key==="Enter")$("#taskSave").click()});
function _noop(){
}
const TITLES={dashboard:"Dashboard",subjects:"Syllabus",tests:"Tests",marks:"Marks",revision:"Revision",questions:"Question bank",planner:"Study planner",calendar:"Calendar"};
function page(name){if(!$("#"+name))return;$$(".page").forEach(p=>p.classList.remove("active"));$("#"+name).classList.add("active");$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===name));$("#crumb").textContent=TITLES[name]||name;$("#title").textContent=name==="dashboard"?`${greet()}, ${profile?.name||"student"}`:({subjects:"Your syllabus",tests:"Test planner",marks:"Marks tracker",revision:"Revision centre",questions:"Competency question bank",planner:"Study planner",calendar:"Study calendar"}[name]||name);window.scrollTo({top:0})}
$$("[data-page]").forEach(b=>b.onclick=()=>page(b.dataset.page));$("#search").oninput=()=>renderSyllabus();
$("#mSubject").innerHTML=Object.keys(syllabus).map(x=>`<option>${esc(x)}</option>`).join("");
$("#addMark").onclick=()=>{const subject=$("#mSubject").value,test=$("#mTest").value.trim(),score=parseFloat($("#mScore").value),total=parseFloat($("#mTotal").value),err=m=>$("#mErr").textContent=m;
 if(!test)return err("Enter the test name.");if(!(total>0))return err("Total marks must be greater than 0.");if(!(score>=0)||score>total)return err("Marks scored must be between 0 and the total.");
 err("");s.marks.push({subject,test,score,total});$("#mTest").value="";$("#mScore").value="";$("#mTotal").value="";save()};
$("#prev").onclick=()=>{cur.setMonth(cur.getMonth()-1);renderCalendar()};$("#next").onclick=()=>{cur.setMonth(cur.getMonth()+1);renderCalendar()};
$("#theme").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("cbseDark",document.body.classList.contains("dark"))};if(localStorage.getItem("cbseDark")==="true")document.body.classList.add("dark");
updateProfileUI();
setupPlanner();
setupTests();
$("#saveProfile").onclick=saveProfile;
$("#profileBtn").onclick=()=>setMenu(menu.hidden);
$("#profileModal").addEventListener("click",e=>{if(e.target.id==="profileModal" && profile)closeProfile()});
async function doSignOut(){try{await clerk.signOut()}catch(e){console.error(e)}location.reload()}
$("#signOutBtn").onclick=doSignOut;$("#menuSignOut").onclick=doSignOut;
const menu=$("#userMenu");
function setMenu(open){menu.hidden=!open;$("#profileBtn").setAttribute("aria-expanded",String(open))}
$("#editProfileBtn").onclick=()=>{setMenu(false);openProfile()};
$("#cancelProfile").onclick=()=>{if(profile)closeProfile()};
document.addEventListener("click",e=>{if(!e.target.closest(".usermenu"))setMenu(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){setMenu(false);if(profile)closeProfile();closeTask()}});
if(!profile)openProfile(true);
render();

};
