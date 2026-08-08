
/* =========================================================
   CBSE PRO — ATTRACTIVE STREAK + CLERK ACCOUNT SYNC
   Uses Clerk unsafeMetadata for non-sensitive study progress.
   No Clerk secret key is exposed in the browser.
   ========================================================= */
const CBSE_STREAK_KEY = "cbseProStreak";

function cbseDateKey(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
}
function cbseLocalStreak() {
  try {
    const s = JSON.parse(localStorage.getItem(CBSE_STREAK_KEY) || "{}");
    return {current:+(s.current||0), best:+(s.best||0), last:s.last||"", days:Array.isArray(s.days)?s.days:[]};
  } catch { return {current:0,best:0,last:"",days:[]}; }
}
function cbseSaveLocalStreak(s) {
  s.days=[...new Set(s.days)].sort().slice(-180);
  localStorage.setItem(CBSE_STREAK_KEY, JSON.stringify(s));
}
function cbseStreakFromMetadata(user) {
  const m = user?.unsafeMetadata?.cbsePro;
  if (!m?.streak) return null;
  return {
    current:+(m.streak.current||0),
    best:+(m.streak.best||0),
    last:m.streak.last||"",
    days:Array.isArray(m.streak.days)?m.streak.days:[]
  };
}
async function cbseSyncStreakToClerk(streak) {
  const user = window.clerk?.user;
  if (!user?.update) return false;
  try {
    await user.update({
      unsafeMetadata: {
        ...(user.unsafeMetadata || {}),
        cbsePro: {
          ...(user.unsafeMetadata?.cbsePro || {}),
          streak: {
            current: streak.current,
            best: streak.best,
            last: streak.last,
            days: streak.days
          },
          streakSyncedAt: new Date().toISOString()
        }
      }
    });
    return true;
  } catch (err) {
    console.warn("Clerk streak sync failed; keeping local copy.", err);
    return false;
  }
}
async function cbseLoadStreakFromClerk() {
  const user = window.clerk?.user;
  const remote = cbseStreakFromMetadata(user);
  if (!remote) return cbseLocalStreak();

  const local = cbseLocalStreak();
  // Prefer the account copy, but keep any newer local day.
  const merged = {
    current: remote.current,
    best: Math.max(remote.best, local.best),
    last: remote.last || local.last,
    days: [...new Set([...remote.days, ...local.days])].sort().slice(-180)
  };
  cbseSaveLocalStreak(merged);
  return merged;
}
function cbseRenderStreak(s=cbseLocalStreak()) {
  document.querySelectorAll("[data-streak-current]").forEach(e=>e.textContent=s.current);
  document.querySelectorAll("[data-streak-best]").forEach(e=>e.textContent=s.best);
  document.querySelectorAll("[data-streak-status]").forEach(e=>{
    e.textContent = s.last===cbseDateKey()
      ? "Today's study activity is recorded ✓"
      : "Complete one study activity today to keep your streak alive";
  });
  document.querySelectorAll("[data-streak-count-label]").forEach(e=>e.textContent=s.current===1?"day":"days");
}
async function cbseRecordStudyActivity(reason="Study activity") {
  const s=cbseLocalStreak(), today=cbseDateKey();
  if(s.last===today){ cbseRenderStreak(s); return s; }

  if(s.last){
    const last=new Date(s.last+"T00:00:00");
    const diff=Math.round((new Date(today+"T00:00:00")-last)/86400000);
    s.current=(diff===1)?s.current+1:1;
  } else s.current=1;

  s.best=Math.max(s.best,s.current);
  s.last=today;
  s.days.push(today);
  cbseSaveLocalStreak(s);
  cbseRenderStreak(s);

  await cbseSyncStreakToClerk(s);
  window.dispatchEvent(new CustomEvent("cbse:streak-updated",{detail:{...s,reason}}));
  return s;
}
window.cbseRecordStudyActivity=cbseRecordStudyActivity;

document.addEventListener("DOMContentLoaded", async ()=>{
  let s=await cbseLoadStreakFromClerk();
  cbseRenderStreak(s);

  document.addEventListener("click", e=>{
    const el=e.target.closest("button,a,input[type=checkbox],[role=button]");
    if(!el) return;
    const text=(el.textContent||el.getAttribute("aria-label")||"").toLowerCase();
    if(/complete|completed|mark done|finish|study done|done today|save progress|mark as done/.test(text)){
      cbseRecordStudyActivity(text.trim()||"Study activity");
    }
  });
});

window.startDashboard = async function(){
  const authScreen=document.getElementById("authScreen");
  const appShell=document.getElementById("appShell");
  const clerk=window.Clerk;
  if (!clerk) {
    authScreen.innerHTML = '<div class="auth-card"><h1>Unable to load sign in</h1><p>Clerk could not be initialized. Please refresh the page.</p></div>';
    return;
  }
  if (!clerk.isSignedIn) {
    appShell.style.display = "none";
    const appUrl = new URL("/cbse-class10-tracker/", window.location.origin).toString();
    clerk.mountSignIn(document.getElementById("clerkAuth"), {
      // GitHub Pages is hosted under /cbse-class10-tracker/, not /.
      // Use the actual current site URL so Clerk never redirects to the
      // repository root and produces a GitHub Pages 404.
      forceRedirectUrl: appUrl,
      fallbackRedirectUrl: appUrl,
      signUpForceRedirectUrl: appUrl,
      signUpFallbackRedirectUrl: appUrl,
      signUpUrl: appUrl,
      routing: "hash"
    });
    clerk.addListener(() => { if (clerk.isSignedIn) location.reload(); });
    return;
  }
  authScreen.style.display = "none";
  appShell.style.display = "grid";

const syllabus={
"Mathematics":["Real Numbers","Polynomials","Pair of Linear Equations","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry","Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes","Statistics","Probability"],
"Science":["Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and Its Compounds","Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity","Light – Reflection and Refraction","Human Eye and Colourful World","Electricity","Magnetic Effects of Electric Current","Our Environment"],
"Social Science":["Rise of Nationalism in Europe","Nationalism in India","Making of a Global World","Age of Industrialisation","Print Culture and Modern World","Resources and Development","Forest and Wildlife Resources","Water Resources","Agriculture","Manufacturing Industries","Power Sharing","Federalism","Gender, Religion and Caste","Political Parties","Outcomes of Democracy","Development","Sectors of Indian Economy","Money and Credit","Globalisation","Consumer Rights"],
"English":["A Letter to God","Nelson Mandela","Two Stories About Flying","Diary of Anne Frank","Glimpses of India","Mijbil the Otter","Madam Rides the Bus","Sermon at Benares","The Proposal","Dust of Snow","Fire and Ice","A Tiger in the Zoo","How to Tell Wild Animals","The Ball Poem","Amanda!","The Trees","Fog","Custard the Dragon","For Anne Gregory"],
"Hindi Course B":["साखी — कबीर","पद — मीरा","मनुष्यता — मैथिलीशरण गुप्त","पर्वत प्रदेश में पावस — सुमित्रानंदन पंत","तोप — वीरेन डंगवाल","कर चले हम फ़िदा — कैफ़ी आज़मी","आत्मत्राण — रवींद्रनाथ ठाकुर","बड़े भाई साहब — प्रेमचंद","डायरी का एक पन्ना — सीताराम सेकसरिया","तताँरा-वामीरो कथा — लीलाधर मंडलोई","तीसरी कसम के शिल्पकार शैलेंद्र — प्रहलाद अग्रवाल","अब कहाँ दूसरे के दुख से दुखी होने वाले — निदा फ़ाज़ली","पतझर में टूटी पत्तियाँ — रवींद्र केलेकर","कारतूस — हबीब तनवीर","हरिहर काका — मिथिलेश्वर","सपनों के-से दिन — गुरदयाल सिंह","टोपी शुक्ला — राही मासूम रज़ा"]
};
let s=JSON.parse(localStorage.getItem("cbsePro")||'{"done":{},"marks":[],"revision":{},"events":{},"streak":0}');
let profile=(function(){
 const u=clerk.user;
 const meta=u?.unsafeMetadata||{};
 return (u?.fullName||u?.firstName||meta.name)?{name:u.fullName||u.firstName||meta.name,class:String(meta.class||"10")} : null;
})();
const $=x=>document.querySelector(x), $$=x=>document.querySelectorAll(x);
const key=(sub,i)=>sub+"::"+i;
function total(){return Object.values(syllabus).reduce((n,a)=>n+a.length,0)}
function done(){return Object.entries(syllabus).reduce((n,[sub,a])=>n+a.filter((_,i)=>s.done[key(sub,i)]).length,0)}
function save(){localStorage.setItem("cbsePro",JSON.stringify(s));render()}
function pct(sub){return Math.round(syllabus[sub].filter((_,i)=>s.done[key(sub,i)]).length/syllabus[sub].length*100)}
function initials(name){
 const parts=String(name||"Student").trim().split(/\s+/).filter(Boolean);
 return (parts.length>1?parts[0][0]+parts[parts.length-1][0]:parts[0][0]).toUpperCase().slice(0,2);
}
function updateProfileUI(){
 const name=profile?.name||"Student";
 const cls=profile?.class||"10";
 $("#profileBtn").textContent=initials(name);
 $("#title").textContent=`Good evening, ${name} 👋`;
 $(".brand small").textContent=`Class ${cls} • 2026–27`;
 $("#profileBtn").title=`${name} • Class ${cls}`;
}
function openProfile(force=false){
 const modal=$("#profileModal");
 if(!modal)return;
 $("#studentName").value=profile?.name||"";
 $("#studentClass").value=profile?.class||"10";
 $("#profileError").textContent="";
 modal.classList.add("show"); modal.setAttribute("aria-hidden","false");
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
   await clerk.user.update({firstName:name});
   await clerk.user.updateMetadata({unsafeMetadata:{class:profile.class,name:profile.name}});
   profile={name:clerk.user.fullName||name,class:profile.class};
   updateProfileUI(); closeProfile();
 }catch(e){
   $("#profileError").textContent="Could not save profile. Please try again.";
 }
}

function setupPlanner(){
 const subj=$('#pSubject'); if(!subj) return;
 const validSubjects=Object.keys(syllabus);
 const saved=JSON.parse(localStorage.getItem('cbseAIPlanner')||'null');
 if(saved){
   ['pDate','pTarget','pHours','pLevel','pSubject','pChapters','pWeak'].forEach(id=>{if(saved[id]!==undefined && $('#'+id)) $('#'+id).value=saved[id]});
   if(saved.planHtml) { $('#planOutput').innerHTML=saved.planHtml; $('#planSummary').textContent=saved.summary||'Saved plan'; }
 }
 const today=new Date(); today.setHours(0,0,0,0);
 const min=today.toISOString().slice(0,10);
 $('#pDate').min=min;
 if(!$('#pDate').value){ const d=new Date(today); d.setDate(d.getDate()+7); $('#pDate').value=d.toISOString().slice(0,10); }
 function dashboardInsight(subject){
   const completed=(syllabus[subject]||[]).filter((_,i)=>s.done[key(subject,i)]).length;
   const totalCh=(syllabus[subject]||[]).length;
   const incomplete=incompleteChapters(subject);
   const subjectMarks=(s.marks||[]).filter(m=>String(m.subject).toLowerCase()===subject.toLowerCase());
   const avg=subjectMarks.length?Math.round(subjectMarks.reduce((a,m)=>a+(m.score/m.total*100),0)/subjectMarks.length):null;
   return {completed,totalCh,incomplete,avg,marks:subjectMarks};
 }
 const syncFromDashboard=()=>{
   const subject=subj.value;
   if(!subject)return;
   const info=dashboardInsight(subject);
   const chapters=incompleteChapters(subject);
   if(!$('#pChapters').value.trim()) $('#pChapters').value=chapters.slice(0,12).join(', ');
   if(info.avg!==null){
     const target=Math.max(60,Math.min(95,Math.round(info.avg+10)));
     $('#pTarget').value=target;
     $('#pLevel').value=info.avg<50?'weak':info.avg<75?'average':'strong';
   }
   if(!$('#pWeak').value.trim() && info.avg!==null){
     $('#pWeak').value=info.avg<60?'Focus on concepts, formulas and basic questions':info.avg<80?'Focus on mistakes, competency questions and timed practice':'Focus on timed practice, case-based questions and final revision';
   }
   const syncNote=$('#plannerSyncNote');
   if(syncNote) syncNote.innerHTML=`✓ Synced with dashboard: <b>${info.completed}/${info.totalCh}</b> chapters complete${info.avg!==null?` • latest average <b>${info.avg}%</b>`:''}`;
 };
 const refreshStats=()=>{
   const hours=Math.max(.5,+$('#pHours').value||0);
   const date=$('#pDate').value;
   const days=date?dateDiff(date,min):0;
   $('#plannerDays').textContent=days>0?days:'—';
   $('#plannerHours').textContent=hours?hours+'h':'—';
   const readiness=[date,$('#pSubject').value,$('#pHours').value,$('#pTarget').value].filter(Boolean).length;
   const pct=Math.round(readiness/4*100);
   $('#planReadiness').textContent=pct+'%'; $('#planReadinessBar').style.width=pct+'%';
 };
 ['pDate','pHours','pTarget','pSubject'].forEach(id=>$('#'+id)?.addEventListener('input',refreshStats));
 subj.addEventListener('change',()=>{syncFromDashboard();refreshStats();});
 $('#syncPlanner').onclick=()=>{syncFromDashboard();refreshStats();};
 refreshStats();
 $('#generatePlan').onclick=generatePlan;
 $('#clearPlan').onclick=()=>{localStorage.removeItem('cbseAIPlanner'); $('#planOutput').innerHTML='<div class="empty-plan fancy-empty"><div class="empty-icon">🤖</div><b>Ready to build your plan?</b><p>Use your dashboard data or enter your test details. The planner will balance <strong>Learn → Practice → Revise</strong>.</p><div class="empty-flow"><span>📖 Learn</span><i>→</i><span>🧠 Practice</span><i>→</i><span>🔁 Revise</span></div></div>'; $('#planSummary').textContent='Your plan will appear here.'; if($('#plannerSyncNote'))$('#plannerSyncNote').textContent='Not synced yet'; refreshStats();};
 if(subj.value) syncFromDashboard();
}

function dateDiff(a,b){return Math.max(0,Math.ceil((new Date(a+'T00:00:00')-new Date(b+'T00:00:00'))/86400000));}
function formatDate(d){return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});}
function incompleteChapters(subject){return (syllabus[subject]||[]).filter((_,i)=>!s.done[key(subject,i)]);}
function generatePlan(){
 const subject=$('#pSubject').value, testDate=$('#pDate').value, hours=Math.max(.5,+$('#pHours').value||0), target=Math.min(100,Math.max(1,+$('#pTarget').value||80)), level=$('#pLevel').value, weak=$('#pWeak').value.trim();
 if(!subject||!testDate||!hours){alert('Please enter the test date, subject and study hours.');return;}
 const today=new Date(); today.setHours(0,0,0,0); const todayStr=today.toISOString().slice(0,10); const days=dateDiff(testDate,todayStr);
 if(days<1){alert('Choose a test date at least 1 day from today.');return;}
 const info=(function(){
   const completed=(syllabus[subject]||[]).filter((_,i)=>s.done[key(subject,i)]).length;
   const totalCh=(syllabus[subject]||[]).length;
   const incomplete=incompleteChapters(subject);
   const subjectMarks=(s.marks||[]).filter(m=>String(m.subject).toLowerCase()===subject.toLowerCase());
   const avg=subjectMarks.length?Math.round(subjectMarks.reduce((a,m)=>a+(m.score/m.total*100),0)/subjectMarks.length):null;
   return {completed,totalCh,incomplete,avg};
 })();
 let raw=$('#pChapters').value.split(',').map(x=>x.trim()).filter(Boolean);
 if(!raw.length) raw=info.incomplete;
 if(!raw.length) raw=[subject+' revision'];
 const priority=weak?weak.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean):[];
 const weighted=raw.map((ch,n)=>{
   const isWeak=priority.some(w=>ch.toLowerCase().includes(w)||w.includes(ch.toLowerCase()));
   const chapterIndex=(syllabus[subject]||[]).findIndex(x=>x.toLowerCase()===ch.toLowerCase());
   const alreadyDone=chapterIndex>=0 && !!s.done[key(subject,chapterIndex)];
   return {ch,weight:isWeak?3:(alreadyDone?0.7:1)};
 }).filter(x=>x.weight>0);
 const usableDays=Math.max(1,days);
 const phase=Math.max(1,Math.ceil(usableDays*.6));
 const practiceStart=Math.max(1,Math.floor(usableDays*.45));
 const plan=[]; let idx=0;
 for(let day=0;day<usableDays;day++){
   const d=new Date(today); d.setDate(today.getDate()+day);
   const isLast=day===usableDays-1;
   const isPractice=day>=practiceStart-1;
   let focus=[];
   if(isLast) focus=weighted.map(x=>x.ch);
   else {
     const slots=Math.max(1,Math.ceil(weighted.length/Math.max(1,phase)));
     for(let k=0;k<slots && idx<weighted.length;k++){focus.push(weighted[idx].ch);idx++;}
   }
   if(!focus.length) focus=['Revision of completed chapters'];
   let learn,practice,revision;
   if(isLast){learn=Math.min(.5,hours*.15);practice=Math.max(.5,hours*.5);revision=Math.max(.25,hours-learn-practice);}
   else if(!isPractice){learn=hours*(level==='weak'?.55:level==='average'?.45:.35);practice=hours*(level==='weak'?.25:.35);revision=hours-learn-practice;}
   else {learn=hours*.2;practice=hours*(level==='strong'?.55:.5);revision=hours-learn-practice;}
   const round=q=>Math.max(.25,Math.round(q*4)/4);
   learn=round(learn);practice=round(practice);revision=round(Math.max(.25,hours-learn-practice));
   plan.push({d,focus,learn,practice,revision,isLast,isPractice});
 }
 const avgLine=info.avg!==null?` Dashboard average: ${info.avg}%.`:' No previous marks found for this subject.';
 const syncLine=`Synced from syllabus: ${info.completed}/${info.totalCh} chapters complete.${avgLine}`;
 const html=plan.map((x,i)=>`<article class="plan-day ${x.isLast?'exam-eve':''}"><div class="plan-day-head"><span class="plan-day-num">${i+1}</span><div><b>${formatDate(x.d)}</b><small>${x.isLast?'🔥 Final revision + mock test':x.isPractice?'🧠 Practice phase':'📖 Learning phase'}</small></div></div><div class="plan-focus"><b>Focus:</b> ${x.focus.map(esc).join(', ')}</div><div class="plan-blocks"><span>📖 Learn ${x.learn}h</span><span>🧠 Practice ${x.practice}h</span><span>🔁 Revise ${x.revision}h</span></div></article>`).join('');
 const summary=`${subject} • ${usableDays} day${usableDays===1?'':'s'} • ${hours}h/day • Target ${target}%`;
 $('#planSummary').textContent=summary; $('#planOutput').innerHTML=`<div class="plan-intro"><b>${summary}</b><p>${esc(syncLine)} ${weak?`Priority: ${esc(weak)}.`:'Planner prioritised incomplete chapters and your dashboard progress.'}</p></div>${html}`;
 if($('#plannerSyncNote')) $('#plannerSyncNote').innerHTML=`✓ Plan synced with <b>${info.completed}/${info.totalCh}</b> syllabus progress${info.avg!==null?` and <b>${info.avg}%</b> subject average`:''}`;
 localStorage.setItem('cbseAIPlanner',JSON.stringify({pDate:testDate,pTarget:target,pHours:hours,pLevel:level,pSubject:subject,pChapters:$('#pChapters').value,pWeak:weak,planHtml:$('#planOutput').innerHTML,summary}));
}

function render(){
 const d=done(),t=total(),p=Math.round(d/t*100),marks=s.marks;
 $("#done").textContent=d;$("#left").textContent=t-d;$("#streak").textContent=s.streak||0;$("#sideStreak").textContent=(s.streak||0)+" days";$("#overall").textContent=p+"%";$("#avg").textContent=(marks.length?Math.round(marks.reduce((a,m)=>a+m.score/m.total*100,0)/marks.length):0)+"%";$(".circle").style.setProperty("--p",p+"%");
 $("#subjectProgress").innerHTML=Object.keys(syllabus).map(x=>`<div class="progressitem"><div class="row"><span>${x}</span><b>${pct(x)}%</b></div><div class="bar"><div class="fill" style="width:${pct(x)}%"></div></div></div>`).join("");
 $("#marksMini").innerHTML=marks.length?marks.slice(-5).reverse().map(m=>`<div class="minirow"><span>${m.subject}</span><span>${m.test}</span><b class="score">${Math.round(m.score/m.total*100)}%</b></div>`).join(""):"<p style='color:var(--muted)'>No marks yet. Add your first test.</p>";
 renderSyllabus();renderMarks();renderRevision();renderCalendar();
}
function renderSyllabus(){
 let q=($("#search")?.value||"").toLowerCase();
 $("#syllabus").innerHTML=Object.entries(syllabus).map(([sub,a])=>{let items=a.map((c,i)=>({c,i})).filter(x=>x.c.toLowerCase().includes(q));if(!items.length)return "";let d=pct(sub);return `<div class="panel subjectbox"><div class="subjecttop"><h3>${sub}</h3><span class="pill">${d}% complete</span></div><div class="chapters">${items.map(x=>`<label class="chapter ${s.done[key(sub,x.i)]?'done':''}"><input type="checkbox" data-sub="${sub}" data-i="${x.i}" ${s.done[key(sub,x.i)]?'checked':''}><span>${x.c}</span></label>`).join("")}</div></div>`}).join("");
$$("[data-sub]").forEach(el=>el.onchange=()=>{s.done[key(el.dataset.sub,el.dataset.i)]=el.checked;if(el.checked)s.revision[key(el.dataset.sub,el.dataset.i)]={date:new Date().toLocaleDateString(),level:"Due today"};save()})
}
function renderMarks(){
 const box=$("#marksTable");if(!s.marks.length){box.innerHTML="<p style='color:var(--muted)'>No results recorded.</p>";return}
 box.innerHTML=`<div class="tablehead"><span>Subject</span><span>Test</span><span>Score</span><span></span></div>`+s.marks.map((m,i)=>`<div class="markrow"><span>${m.subject}</span><span>${m.test}</span><b>${m.score}/${m.total}</b><button class="del" data-del="${i}">×</button></div>`).join("");
$$("[data-del]").forEach(b=>b.onclick=()=>{s.marks.splice(+b.dataset.del,1);save()})
}
function renderRevision(){
 let items=[];Object.entries(s.revision).forEach(([k,v])=>{let [sub,i]=k.split("::");if(s.done[k])items.push({k,sub,name:syllabus[sub][i],...v})});
 $("#revisionList").innerHTML=items.length?items.map(x=>`<div class="rev"><div class="revtop"><b>${x.name}</b><span class="pill">${x.level||"Due today"}</span></div><small>${x.sub} • Last completed ${x.date}</small><button data-rev="${x.k}">Mark revised ✓</button></div>`).join(""):"<div class='panel'><b>No revision items yet.</b><p style='color:var(--muted)'>Complete a chapter and it will appear here.</p></div>";
$$("[data-rev]").forEach(b=>b.onclick=()=>{s.revision[b.dataset.rev]={date:new Date().toLocaleDateString(),level:"Revised"};save()})
}
let cur=new Date();
function renderCalendar(){
 $("#month").textContent=cur.toLocaleString("en-IN",{month:"long",year:"numeric"});
 let y=cur.getFullYear(),m=cur.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),out="";
 for(let i=0;i<first;i++)out+="<div class='day muted'></div>";
 for(let d=1;d<=days;d++){let date=new Date(y,m,d),id=date.toISOString().slice(0,10),today=new Date().toISOString().slice(0,10);out+=`<div class="day ${id===today?'today':''} ${s.events[id]?'has':''}" data-date="${id}"><b>${d}</b>${s.events[id]?"<div class='dot'></div>":""}</div>`}
 $("#days").innerHTML=out;$$("[data-date]").forEach(el=>el.onclick=()=>{let id=el.dataset.date;let task=prompt("Study task for "+id+":",s.events[id]||"");if(task===null)return;if(task.trim())s.events[id]=task;else delete s.events[id];save()})
}
function page(name){$$(".page").forEach(p=>p.classList.remove("active"));$("#"+name).classList.add("active");$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===name));$("#crumb").textContent=name.toUpperCase();$("#title").textContent=name==="dashboard"?`Good evening, ${profile?.name||"scholar"} 👋`:name==="subjects"?"Your syllabus":name==="marks"?"Marks tracker":name==="revision"?"Revision center":name==="questions"?"Competency Question Bank":name==="planner"?"AI Study Planner":"Study calendar"}
$$("[data-page]").forEach(b=>b.onclick=()=>page(b.dataset.page));$("#search").oninput=renderSyllabus;
$("#addMark").onclick=()=>{let subject=$("#mSubject").value.trim(),test=$("#mTest").value.trim(),score=+$("#mScore").value,total=+$("#mTotal").value;if(!subject||!test||!total||score<0||score>total){alert("Please enter valid subject, test, score and total marks.");return}s.marks.push({subject,test,score,total});["mSubject","mTest","mScore","mTotal"].forEach(id=>$("#"+id).value="");save()};
$("#prev").onclick=()=>{cur.setMonth(cur.getMonth()-1);renderCalendar()};$("#next").onclick=()=>{cur.setMonth(cur.getMonth()+1);renderCalendar()};
$("#theme").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("cbseDark",document.body.classList.contains("dark"))};if(localStorage.getItem("cbseDark")==="true")document.body.classList.add("dark");
updateProfileUI();
setupPlanner();
$("#saveProfile").onclick=saveProfile;
$("#profileBtn").onclick=()=>openProfile();
$("#profileModal").addEventListener("click",e=>{if(e.target.id==="profileModal" && profile)closeProfile()});
$("#signOutBtn").onclick=async()=>{await clerk.signOut();location.reload()};
if(!profile)openProfile(true);
render();
// Competency-based question bank + optional GitHub JSON sync
let questionBank = Array.isArray(window.CBSE_QUESTION_BANK) ? window.CBSE_QUESTION_BANK : [];
let filteredQuestions = [];

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function setupQuestionBank(){
  const subject=$("#qSubject"), chapter=$("#qChapter"), type=$("#qType"), marks=$("#qMarks");
  if(!subject) return;
  [...new Set(questionBank.map(q=>q.subject))].sort().forEach(x=>subject.insertAdjacentHTML("beforeend",`<option>${esc(x)}</option>`));
  $("#githubUrl").value=localStorage.getItem("cbseGithubUrl")||"";
  subject.onchange=()=>{updateChapterOptions();renderQuestions()};
  chapter.onchange=()=>renderQuestions(); type.onchange=()=>renderQuestions(); marks.onchange=()=>renderQuestions();
  $("#showAllQ").onclick=()=>renderQuestions(true);
  $("#randomQ").onclick=()=>{let pool=getFiltered();if(!pool.length)return;renderQuestionCards([pool[Math.floor(Math.random()*pool.length)]])};
  $("#syncGithub").onclick=syncGithub;
  updateChapterOptions(); renderQuestions(true);
}
function updateChapterOptions(){
  const subject=$("#qSubject"), chapter=$("#qChapter"); if(!chapter)return;
  const current=chapter.value;
  const qs=questionBank.filter(q=>!subject.value||q.subject===subject.value);
  chapter.innerHTML='<option value="">All chapters</option>'+[...new Set(qs.map(q=>q.chapter))].sort().map(x=>`<option>${esc(x)}</option>`).join("");
  if([...chapter.options].some(o=>o.value===current)) chapter.value=current;
}
function getFiltered(){
  const subject=$("#qSubject").value, chapter=$("#qChapter").value, type=$("#qType").value, marks=$("#qMarks").value;
  return questionBank.filter(q=>(!subject||q.subject===subject)&&(!chapter||q.chapter===chapter)&&(!type||q.type===type)&&(!marks||String(q.marks)===marks));
}
function renderQuestionCards(showAll=false){
  filteredQuestions=getFiltered();
  const list=showAll?filteredQuestions:filteredQuestions.slice(0,10);
  $("#qCount").textContent=`${filteredQuestions.length} questions`;
  $("#questionList").innerHTML=list.length?list.map((q,i)=>`<article class="question-card">
    <div class="qmeta"><span>${esc(q.subject)}</span><span>${esc(q.chapter)}</span><span>${esc(q.type)}</span><span>${q.marks} mark${q.marks==1?"":"s"}</span></div>
    <p class="qtext">${i+1}. ${esc(q.question)}</p>
    <ol class="qopts" type="A">${q.options.map(o=>`<li>${esc(o)}</li>`).join("")}</ol>
    <div class="q-card-actions"><button data-answer="${i}">Show answer</button></div>
    <div class="q-answer" data-answer-box="${i}"><b>Answer:</b> ${esc(q.answer)}<br><small>${esc(q.explanation)}</small></div>
  </article>`).join(""):"<div class='panel'><b>No questions match these filters.</b><p style='color:var(--muted)'>Try another subject, chapter or question type.</p></div>";
  $$("#questionList [data-answer]").forEach(b=>b.onclick=()=>{const box=$(`#questionList [data-answer-box="${b.dataset.answer}"]`);box.classList.toggle("show");b.textContent=box.classList.contains("show")?"Hide answer":"Show answer"});
}
function renderQuestions(showAll=false){renderQuestionCards(showAll)}
async function syncGithub(){
  const input=$("#githubUrl"), status=$("#githubStatus"), url=input.value.trim();
  if(!url){status.textContent="Paste a raw GitHub URL first.";return}
  status.textContent="Syncing…";
  try{
    const res=await fetch(url,{cache:"no-store"});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    if(!Array.isArray(data))throw new Error("JSON must be an array of questions.");
    const valid=data.filter(q=>q.subject&&q.chapter&&q.question&&Array.isArray(q.options)&&q.answer);
    if(!valid.length)throw new Error("No valid questions found.");
    questionBank=valid;
    localStorage.setItem("cbseGithubUrl",url);
    $("#qSubject").innerHTML='<option value="">All subjects</option>';
    [...new Set(questionBank.map(q=>q.subject))].sort().forEach(x=>$("#qSubject").insertAdjacentHTML("beforeend",`<option>${esc(x)}</option>`));
    updateChapterOptions(); renderQuestions(true);
    status.textContent=`Synced ${valid.length} questions from GitHub.`;
  }catch(e){status.textContent=`Sync failed: ${e.message}. Check that the URL is a public raw JSON file.`}
}
setupQuestionBank();

};
