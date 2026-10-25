/* ---------- DATA ---------- */
const SKILLS=["Data analysis","Python","Machine learning","AI ethics","Communication","Project management","Leadership","Creative design","Process improvement","Coaching"];
const ESG_CATEGORIES={
 "Environmental (E)":["Sustainability","Climate awareness","Resource management"],
 "Social (S)":["Diversity & inclusion","Human rights","Employee wellbeing"],
 "Governance (G)":["Business ethics","Compliance","Transparency","Risk management"]
};
const ESG_TARGET=3;
const ESG_SKILLS=Object.values(ESG_CATEGORIES).flat();
const ROLES={
 "Senior AI Analyst":{"Data analysis":5,"Python":4,"Machine learning":4,"AI ethics":3,"Communication":3,"Project management":3},
 "HR Business Partner":{"Communication":5,"Coaching":4,"Leadership":3,"Data analysis":3,"Process improvement":3,"AI ethics":2},
 "Operations Manager":{"Process improvement":5,"Project management":5,"Leadership":4,"Data analysis":3,"Communication":4},
 "UX Designer":{"Creative design":5,"Communication":4,"Data analysis":3,"Project management":2,"Process improvement":2},
 "Team Lead":{"Leadership":5,"Coaching":4,"Communication":4,"Project management":4,"Process improvement":3}
};
const C="https://www.coursera.org/search?query=";
const LEARN={
 "Data analysis":["Applied Data Science","https://www.coursera.org/specializations/data-science-python","Analyse a real HR dataset and present three findings."],
 "Python":["Python for Everybody",C+"python","Automate one weekly report with a short script."],
 "Machine learning":["Neural Networks and Deep Learning","https://www.coursera.org/learn/neural-networks-deep-learning","Build a small prediction model with a mentor."],
 "AI ethics":["Ethical AI Governance","https://www.coursera.org/learn/ai-ethics","Review a current tool against company compliance rules."],
 "Communication":["Effective Communication",C+"business communication","Present results to a manager and collect feedback."],
 "Project management":["Project Management Foundations",C+"project management","Lead a small cross-team project from plan to review."],
 "Leadership":["Leading People and Teams",C+"leading people and teams","Run a team meeting and a one-to-one coaching session."],
 "Creative design":["Design Thinking",C+"design thinking","Redesign one internal form or process screen."],
 "Process improvement":["Lean Six Sigma Basics",C+"lean six sigma","Map one workflow and remove two wasted steps."],
 "Coaching":["Coaching Skills for Managers",C+"coaching skills","Shadow an experienced coach for two sessions."],
 "Sustainability":["Sustainability Foundations",C+"sustainability","Identify one practical sustainability improvement in the employee’s workflow."],
 "Climate awareness":["Climate Change: Science and Impacts",C+"climate change","Assess a relevant climate risk or opportunity with the team."],
 "Resource management":["Resource Efficiency",C+"resource management sustainability","Map resource use in one process and propose a measurable reduction."],
 "Diversity & inclusion":["Diversity and Inclusion",C+"diversity inclusion","Review a team process for access and inclusion barriers."],
 "Human rights":["Business and Human Rights",C+"business human rights","Map human-rights risks in a relevant supplier or business process."],
 "Employee wellbeing":["Workplace Wellbeing",C+"employee wellbeing","Co-design one voluntary team wellbeing improvement and check its impact."],
 "Business ethics":["Business Ethics",C+"business ethics","Work through an ethics scenario using the organization’s code."],
 "Compliance":["Compliance Foundations",C+"compliance fundamentals","Review one role-relevant control with the compliance team."],
 "Transparency":["Transparency and Reporting",C+"business transparency reporting","Practice documenting a decision, its rationale, and relevant disclosures."],
 "Risk management":["Risk Management Foundations",C+"risk management","Build a simple risk register for a project and review mitigations."]
};
const LV=["Not yet","Beginner","Basic","Competent","Advanced","Expert"];

/* ---------- STATE ---------- */
let S={name:"",role:"",target:"Senior AI Analyst",goals:"",skills:{},esg:{}};
try{const x=JSON.parse(localStorage.getItem("skillgap"));if(x)S=x}catch(e){}
if(!S.esg||typeof S.esg!=="object"||Array.isArray(S.esg))S.esg={};
let coachHistory=[];
let coachPending=false;
const save=()=>{try{localStorage.setItem("skillgap",JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const API_BASE=location.pathname.startsWith("/xampp/skillgap-analyzer/")
 ?"http://127.0.0.1:8000"
 :"";
const savedGrowthPlan=()=>{
 try{return JSON.parse(localStorage.getItem("skillgap-growth-plan")||"null")}
 catch(e){return null}
};
const growthSummary=()=>{
 const a=analyse();
 return[
  "SkillGap Analyzer — Career Growth Plan",
  `Employee: ${S.name||"Not provided"}`,
  `Current role: ${S.role||"Not provided"}`,
  `Target role: ${S.target}`,
  `Readiness: ${a.score}%`,
  `Priority gaps: ${a.gaps.slice(0,3).map(g=>g.k).join(", ")||"None identified"}`,
  `Career goals: ${S.goals||"Not provided"}`,
  "Skill ratings:",
  ...a.rows.map(r=>`- ${r.category}: ${r.k}: ${LV[r.have]} (target: ${LV[r.need]})`),
  `ESG assessment: ${esgSummary().rated}/${ESG_SKILLS.length} competencies rated`
 ].join("\n");
};

/* ---------- ANALYSIS ---------- */
function esgRows(){
 return Object.entries(ESG_CATEGORIES).flatMap(([category,skills])=>
  skills.filter(k=>Object.prototype.hasOwnProperty.call(S.esg,k))
   .map(k=>({k,have:+S.esg[k]||0,need:ESG_TARGET,gap:Math.max(0,ESG_TARGET-(+S.esg[k]||0)),category}))
 );
}
function esgSummary(){
 const rows=esgRows();
 const total=rows.reduce((sum,r)=>sum+r.need,0);
 const got=rows.reduce((sum,r)=>sum+Math.min(r.have,r.need),0);
 return{rated:rows.length,score:total?Math.round(got/total*100):null};
}
function analyse(){
 const req=ROLES[S.target]||{};
 const rows=[
  ...Object.keys(req).map(k=>{const have=+S.skills[k]||0,need=req[k];return{k,have,need,gap:Math.max(0,need-have),category:"Role skills"}}),
  ...esgRows()
 ];
 const total=rows.reduce((a,r)=>a+r.need,0)||1;
 const got=rows.reduce((a,r)=>a+Math.min(r.have,r.need),0);
 return{rows,score:Math.round(got/total*100),gaps:rows.filter(r=>r.gap>0).sort((a,b)=>b.gap-a.gap)};
}
function roleFit(role){
 const req=ROLES[role]||{},skills=Object.keys(req);
 const esg=esgRows();
 const total=skills.reduce((sum,k)=>sum+req[k],0)+esg.reduce((sum,r)=>sum+r.need,0)||1;
 const got=skills.reduce((sum,k)=>sum+Math.min(+S.skills[k]||0,req[k]),0)+esg.reduce((sum,r)=>sum+Math.min(r.have,r.need),0);
 return{role,score:Math.round(got/total*100),gaps:[...skills.filter(k=>(+S.skills[k]||0)<req[k]),...esg.filter(r=>r.gap>0).map(r=>r.k)]};
}
const internalMatches=()=>Object.keys(ROLES).filter(role=>role!==S.target).map(roleFit).sort((a,b)=>b.score-a.score).slice(0,3);
const hasSkills=()=>Object.values(S.skills).some(v=>+v>0)||esgRows().length>0;
const needData=()=>`<div class="empty"><b>No skills rated yet.</b> Rate the employee’s role skills or ESG competencies first, then come back for this page. <p style="margin:.6rem 0 0"><a class="btn alt" href="#skills">Rate skills</a></p></div>`;

/* ---------- VIEWS ---------- */
const V={};
V.home=()=>`
<section class="hero">
  <div>
    <p class="eyebrow">OPTION 5 · GROW</p>
    <h1>Purpose, Potential &amp; Career Growth</h1>
    <p>Help HR develop employees and identify internal growth opportunities. SkillGap Analyzer maps role skills and ESG competencies to future goals, highlights development needs, and recommends practical next steps.</p>
    <a class="btn" href="#profile">Create Employee Profile</a>
    <a class="btn ghost" href="#coach">Meet the Growth Coach</a>
  </div>
  <div class="ladder" aria-label="Example skill ladder">
    <h4>Example: Senior AI Analyst target</h4>
    ${[["Data analysis",80,100],["Machine learning",55,80],["Communication",75,60]].map(([n,v,t])=>`<div class="rung"><span><b>${n}</b><span>${v>=t?"Ready":"Gap"}</span></span><div class="track"><div class="fill" style="width:${v}%"></div><div class="mark" style="left:${t}%"></div></div></div>`).join("")}
    <p style="font-size:.85rem;margin:0;opacity:.8">White marker = what the role needs.</p>
  </div>
</section>
<section>
  <h2>How SkillGap Analyzer Supports Growth</h2>
  <div class="grid">
    <div class="card"><h3>Build an Employee Profile</h3><p>Capture an employee’s role, strengths, current skills, career goals, and development interests in one clear profile.</p></div>
    <div class="card"><h3>Understand Strengths and Gaps</h3><p>Compare role skills and assessed ESG competencies with their development targets to identify priority gaps and recognize potential for internal growth.</p></div>
    <div class="card"><h3>Plan the Next Career Step</h3><p>Turn analysis into practical courses, projects, coaching, and a professional roadmap that HR, managers, and employees can follow.</p></div>
    <div class="card"><h3>Explore Internal Mobility</h3><p>Compare the employee’s current skills with other roles to start a grounded conversation about possible next steps.</p></div>
  </div>
</section>
<section>
  <h2>Help Every Employee Reach Their Potential</h2>
  <p>SkillGap Analyzer gives HR teams and managers a clear way to support growth across all roles. Align employee goals with business needs, improve internal mobility, and turn skill insights into focused development plans.</p>
  <div class="grid">
    <div class="card"><h3>Personalized Recommendations</h3><p>Recommend learning paths based on each employee’s role skills, ESG gaps, target role, and career goals.</p></div>
    <div class="card"><h3>Career Development</h3><p>Help HR and managers plan realistic next steps and connect employees with opportunities inside the organization.</p></div>
    <div class="card"><h3>Clear Skill Mapping</h3><p>See technical, transferable, and role-specific skills in one view, with clear evidence of strengths and development needs.</p></div>
    <div class="card"><h3>Progress Insights</h3><p>Track growth over time, celebrate progress, and spot new gaps before they slow an employee’s career path.</p></div>
  </div>
</section>
<div class="band"><h2>Ready to Plan Your Next Growth Step?</h2><p>Start with an employee’s goals, then explore skills, development options, and internal role matches together.</p><a class="btn" href="#profile">Create Employee Profile</a></div>`;

V.profile=()=>`
<h1 style="font-size:2.4rem">Employee Profile</h1>
<p>Tell us who this employee is and where they want to grow. HR and managers can both use this profile.</p>
<form id="pf">
  <label for="n">Employee name</label><input type="text" id="n" required value="${esc(S.name)}">
  <label for="r">Current role</label><input type="text" id="r" value="${esc(S.role)}" placeholder="e.g. Data Analyst">
  <label for="t">Target role</label>
  <select id="t">${Object.keys(ROLES).map(r=>`<option ${r===S.target?"selected":""}>${r}</option>`).join("")}</select>
  <label for="g">Career goals and development interests</label><textarea id="g" placeholder="What does this employee want to learn or achieve?">${esc(S.goals)}</textarea>
  <p class="privacy-note">Demo privacy note: this prototype saves profile details in this browser only. Avoid entering sensitive employee or performance information.</p>
  <p style="margin-top:1.2rem"><button class="btn" type="submit">Save and rate skills</button></p>
</form>`;

V.skills=()=>`
<h1 style="font-size:2.4rem">Skills Analysis</h1>
<p>Rate ${esc(S.name)||"the employee"}’s current level in each skill. Move the slider; it saves automatically.</p>
<div class="panel" style="max-width:820px">
${SKILLS.map((k,i)=>{const v=+S.skills[k]||0;return`<div class="skillrow"><label for="s${i}" style="margin:0">${k}</label><input type="range" id="s${i}" min="0" max="5" value="${v}" data-k="${k}"><span class="lvl" id="l${i}">${LV[v]}</span></div>`}).join("")}
</div>
<section class="esg-assessment" id="esg-assessment">
 <h2>ESG Skills Assessment</h2>
 <p>Rate ${esc(S.name)||"the employee"}’s current level in these environmental, social, and governance competencies. Ratings save automatically.</p>
 <div class="notice">For this demo, <b>${LV[ESG_TARGET]}</b> is a shared development baseline for every ESG competency, not a role-specific or regulatory standard. Unrated competencies are excluded from gap and readiness scores until rated.</div>
 ${Object.entries(ESG_CATEGORIES).map(([category,skills])=>`<section class="esg-group"><h2>${category}</h2><div class="panel" style="max-width:820px">${skills.map((k,i)=>{const id=`esg-${category.charAt(0)}-${i}`,ratedSkill=Object.prototype.hasOwnProperty.call(S.esg,k),v=ratedSkill?+S.esg[k]:null;return`<div class="skillrow"><label for="${id}" style="margin:0">${k}</label><select id="${id}" data-esg-k="${k}"><option value="" ${ratedSkill?"":"selected"}>Select level</option>${LV.map((level,rating)=>`<option value="${rating}" ${v===rating?"selected":""}>${level}</option>`).join("")}</select><span class="lvl">Target: ${LV[ESG_TARGET]}</span></div>`}).join("")}</div></section>`).join("")}
 <p class="privacy-note" id="esg-rating-status">${esgSummary().rated} of ${ESG_SKILLS.length} ESG competencies rated. ${ESG_SKILLS.length-esgSummary().rated?`${ESG_SKILLS.length-esgSummary().rated} unrated competencies will not yet affect the analysis.`:"All ESG competencies are included in the analysis."}</p>
</section>
<p style="margin-top:1.2rem"><a class="btn" href="#gaps">See skill gaps</a></p>`;

V.gaps=()=>{
 if(!hasSkills())return`<h1 style="font-size:2.4rem">Skill Gap Analysis</h1>${needData()}`;
 const a=analyse();
 return`<h1 style="font-size:2.4rem">Skill Gap Analysis</h1>
 <p>${esc(S.name)||"This employee"} compared with the <b>${esc(S.target)}</b> role and the shared ESG development baseline. The dark marker shows the target level.</p>
 <p class="privacy-note">${esgSummary().rated} of ${ESG_SKILLS.length} ESG competencies rated; unrated competencies are excluded. <a href="#skills">Update ratings in Skills Analysis</a></p>
 ${[...new Set(a.rows.map(r=>r.category))].map(category=>`<section class="gap-group"><h2>${esc(category)}</h2>${a.rows.filter(r=>r.category===category).map(r=>`<div class="gaprow ${r.gap?"gap":""}">
  <span style="display:flex;justify-content:space-between;gap:1rem"><b>${r.k}</b><span class="tag ${r.gap?"":"ok"}">${r.gap?`Gap of ${r.gap} level${r.gap>1?"s":""}`:"Meets target"}</span></span>
  <div class="track"><div class="fill" style="width:${r.have/5*100}%"></div><div class="mark" style="left:calc(${r.need/5*100}% - 1px)"></div></div>
  <span class="lvl">Now: ${LV[r.have]} · Needed: ${LV[r.need]}</span></div>`).join("")}</section>`).join("")}
 <p><a class="btn" href="#training">Get training recommendations</a></p>`;
};

V.training=()=>{
 if(!hasSkills())return`<h1 style="font-size:2.4rem">Training Recommendations</h1>${needData()}`;
 const a=analyse(),top=a.gaps.slice(0,3);
 const phases=["Review the priority gaps with the employee and agree on goals.","Complete the recommended courses, one skill at a time.","Apply the skills in a practical project with a manager or coach.","Review progress, update the profile, and plan the next role step."];
 return`<h1 style="font-size:2.4rem">Training Recommendations</h1>
 ${top.length?`<p>Recommended from the highest role-skill and rated ESG gaps for <b>${esc(S.target)}</b>.</p>
 <div class="grid">${top.map(r=>{const l=LEARN[r.k];return`<div class="card"><span class="tag">Gap: ${esc(r.k)}</span><p class="lvl">${esc(r.category)}</p><h3 style="margin-top:.6rem">${esc(l[0])}</h3><p><b>Project:</b> ${esc(l[2])}</p><p style="margin-top:.8rem"><a href="${l[1]}" target="_blank" rel="noopener">View course</a></p></div>`}).join("")}</div>`
 :`<div class="empty">No rated gaps found. ${esc(S.name)||"The employee"} meets the targets assessed so far.</div>`}
 <p class="privacy-note">${esgSummary().rated} of ${ESG_SKILLS.length} ESG competencies rated. <a href="#skills">Complete or update ESG ratings in Skills Analysis</a> to include those competencies in recommendations.</p>
 <section style="margin-top:2.5rem"><h2>Professional Roadmap</h2>
 ${phases.map((p,i)=>`<div class="phase"><b>Phase ${i+1}</b><br>${p}</div>`).join("")}</section>
 <p><a class="btn" href="#results">View analysis results</a></p>`;
};

V.coach=()=>{
 if(!hasSkills())return`<h1 style="font-size:2.4rem">AI Growth Coach</h1><p>Get a practical development plan based on the employee’s rated skills and chosen role.</p>${needData()}`;
 const matches=internalMatches();
 return`<h1 style="font-size:2.4rem">AI Growth Coach</h1>
 <p>Ask Gemini for tailored career-development ideas, learning priorities, and practical next steps.</p>
 <p class="privacy-note">Gemini can use the employee’s role-skill ratings and ${esgSummary().rated} of ${ESG_SKILLS.length} ESG ratings against the shared ${LV[ESG_TARGET]} baseline. Unrated ESG competencies are omitted. <a href="#skills">Review ratings in Skills Analysis</a>.</p>
 <div class="notice" id="ai-status" role="status" aria-live="polite">Checking Gemini service...</div>
 <div class="coach-layout">
  <div class="panel coach-panel">
   <h2>What would you like help with?</h2>
   <p>Ask follow-up questions to explore a development plan or prepare for a manager conversation.</p>
   <label for="coach-question">Your question</label>
   <textarea id="coach-question" placeholder="e.g. How can we help this employee prepare for their next role?"></textarea>
   <div class="prompt-list" aria-label="Example questions">
    <button class="prompt" type="button" data-question="Create a practical 30-day development plan.">Create a 30-day plan</button>
    <button class="prompt" type="button" data-question="How should a manager discuss the employee’s next career step?">Prepare a manager conversation</button>
    <button class="prompt" type="button" data-question="Which internal role could be a good next step?">Explore internal roles</button>
   </div>
   <label class="consent-label" for="ai-consent"><input id="ai-consent" type="checkbox"> I agree to send the employee’s current and target roles, career goals, role-skill ratings, ESG-skill ratings, and this conversation to Google Gemini for a response. The profile’s employee-name field is excluded.</label>
   <p class="privacy-note">Do not include names in career goals or questions, or add sensitive personal, health, demographic, or performance-review information. AI suggestions may be wrong; review them with the employee and manager. Usage may be subject to Google’s current quotas, pricing, and data-use terms.</p>
   <button class="btn" type="button" data-act="coach">Ask Gemini</button>
  </div>
  <div class="coach-output" id="coach-answer" aria-live="polite" aria-atomic="true">
   <div class="empty"><b>Your AI coaching conversation will appear here.</b><br>Choose a prompt or enter a question to get started.</div>
  </div>
 </div>
 <section class="coach-matches"><h2>Possible internal growth paths</h2>
  <p>These matches use role-skill ratings and rated ESG competencies as skill-fit starting points, not promotion or performance decisions. Validate role requirements and employee interest with a manager.</p>
  <div class="grid">${matches.map(m=>`<article class="card match-card"><span class="tag ok">${m.score}% skill fit</span><h3>${esc(m.role)}</h3><p>${m.gaps.length?`Skills to explore: ${m.gaps.slice(0,2).map(esc).join(", ")}.`:"Current ratings meet the skills mapped to this role."}</p><button class="btn ghost" type="button" data-role="${esc(m.role)}">Compare this role</button></article>`).join("")}</div>
 </section>`;
};

V.results=()=>{
 if(!hasSkills())return`<h1 style="font-size:2.4rem">Analysis Results</h1>${needData()}`;
 const a=analyse(),name=esc(S.name)||"This employee";
 const msg=a.score>=80?"strong alignment with":a.score>=50?"good progress toward":"early steps toward";
 return`<h1 class="screen-only" style="font-size:2.4rem">Readiness Summary</h1>
 <section class="print-only print-report" aria-label="Printable career growth report">
  <p class="eyebrow">SKILLGAP ANALYZER · EMPLOYEE DEVELOPMENT</p>
  <h1>Career Growth Report</h1>
  <p class="print-date">Prepared ${new Date().toLocaleDateString()}</p>
  <div class="print-profile">
   ${S.name?`<p><b>Employee:</b> ${esc(S.name)}</p>`:""}
   ${S.role?`<p><b>Current role:</b> ${esc(S.role)}</p>`:""}
   <p><b>Target role:</b> ${esc(S.target)}</p>
   <p><b>Readiness:</b> ${a.score}%</p>
   ${S.goals?`<p><b>Career goals:</b> ${esc(S.goals)}</p>`:""}
  </div>
  <h2>Role-skill assessment</h2>
  <table class="print-skills"><thead><tr><th>Skill</th><th>Current level</th><th>Target level</th><th>Assessment</th></tr></thead>
   <tbody>${a.rows.filter(r=>r.category==="Role skills").map(r=>`<tr><td>${esc(r.k)}</td><td>${LV[r.have]}</td><td>${LV[r.need]}</td><td>${r.gap?`Development opportunity (${r.gap} level${r.gap>1?"s":""})`:"Meets target"}</td></tr>`).join("")}</tbody>
  </table>
  <h2>ESG skills assessment</h2>
  <p>${esgSummary().rated} of ${ESG_SKILLS.length} competencies rated; ESG readiness: ${esgSummary().score===null?"Not yet assessed":`${esgSummary().score}%`} (shared ${LV[ESG_TARGET]} baseline).</p>
  <table class="print-skills"><thead><tr><th>Category</th><th>Competency</th><th>Current level</th><th>Target level</th><th>Assessment</th></tr></thead>
   <tbody>${esgRows().map(r=>`<tr><td>${esc(r.category)}</td><td>${esc(r.k)}</td><td>${LV[r.have]}</td><td>${LV[r.need]}</td><td>${r.gap?`Development opportunity (${r.gap} level${r.gap>1?"s":""})`:"Meets target"}</td></tr>`).join("")}</tbody>
  </table>
  <h2>Recommended next steps</h2>
  ${a.gaps.length?`<ol>${a.gaps.slice(0,3).map(r=>`<li><b>${esc(r.k)}:</b> ${esc(LEARN[r.k][2])}</li>`).join("")}</ol>`:"<p>Discuss a stretch assignment or explore another development goal.</p>"}
  <p class="print-note">Use this assessment as a development conversation aid, not as a hiring, promotion, or performance decision. Review the plan with the employee and manager.</p>
 </section>
 <div class="results screen-only">
  <div><div class="score" style="--p:${a.score}"><div>${a.score}%</div></div></div>
  <div>
   <p>SkillGap Analyzer helps HR teams identify strengths and plan career paths across role skills and ESG competencies. ${name} shows ${msg} the <b>${esc(S.target)}</b> role with <b>${a.score}% readiness</b> across assessed skills.</p>
   <p>${a.gaps.length?`Priority gaps: <b>${a.gaps.slice(0,3).map(g=>g.k).join(", ")}</b>. We recommend targeted learning and practical projects to connect ${name}’s goals and potential to a clear roadmap.`:"No gaps found among assessed competencies. Unrated ESG competencies are excluded; review them in Skills Analysis."}</p>
   <p><b>ESG assessment:</b> ${esgSummary().rated}/${ESG_SKILLS.length} competencies rated${esgSummary().score===null?"":`, ${esgSummary().score}% readiness`}. Unrated competencies are excluded from the overall score.</p>
   ${S.goals?`<p><b>Career goals:</b> ${esc(S.goals)}</p>`:""}
  </div>
 </div>
 <section class="internal-section screen-only"><h2>Other internal growth opportunities</h2>
  <p>These role matches use rated role skills and ESG competencies. Use them to start a conversation, not as a hiring or promotion decision.</p>
  <div class="grid">${internalMatches().map(m=>`<article class="card match-card"><span class="tag ok">${m.score}% skill fit</span><h3>${esc(m.role)}</h3><p>${m.gaps.length?`Skills to explore: ${m.gaps.slice(0,2).map(esc).join(", ")}.`:"Current ratings meet the skills mapped to this role."}</p><button class="btn ghost" type="button" data-role="${esc(m.role)}">Compare this role</button></article>`).join("")}</div>
 </section>
 <section class="noprint screen-only" style="margin-top:2rem"><h2>Save &amp; Share Results</h2>
  <p>HR teams can export results, share progress, and save a growth plan for future career tracking.</p>
  <div class="grid">
   <div class="card"><h3>Download PDF</h3><p>Get a report of this employee’s skills, growth opportunities, and next steps.</p><p style="margin-top:.8rem"><button class="btn" data-act="pdf">Export Report</button></p></div>
   <div class="card"><h3>Share Profile</h3><p>Copy a concise, text-based summary with role, readiness, priority gaps, goals, and rated skills.</p><p style="margin-top:.8rem"><button class="btn alt" data-act="share">Copy Growth Summary</button></p></div>
   <div class="card"><h3>Save Growth Plan</h3><p>Save a dated snapshot of this profile and its readiness analysis in this browser.</p><p style="margin-top:.8rem"><button class="btn ghost" data-act="save">${savedGrowthPlan()?"Update Saved Plan":"Save Growth Plan"}</button></p>${savedGrowthPlan()?`<p class="saved-status">Saved ${esc(new Date(savedGrowthPlan().savedAt).toLocaleString())} on this device.</p>`:""}</div>
  </div></section>`;
};

/* ---------- ROUTER ---------- */
function render(){
 const requested=(location.hash||"#home").slice(1);
 const page=requested==="esg"?"skills":V[requested]?requested:"home";
 $("#app").innerHTML=V[page]();
 document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.dataset.p===page));
 document.title=page==="home"?"SkillGap Analyzer":`${document.querySelector(`#nav a[data-p=${page}]`).textContent} | SkillGap Analyzer`;
 if(page==="coach"&&hasSkills())checkGeminiStatus();
 if(page==="coach"&&coachHistory.length)showCoachMessages();
 if(requested==="esg")$("#esg-assessment").scrollIntoView();
 else window.scrollTo(0,0);
}
window.addEventListener("hashchange",render);

async function checkGeminiStatus(){
 const status=$("#ai-status");
 try{
  const response=await fetch(`${API_BASE}/api/status`);
  if(!response.ok)throw new Error("Service status unavailable.");
  const data=await response.json();
  status.textContent=data.configured
   ?`Gemini is ready (${data.model}). Profile details are sent only after you agree and submit a question.`
   :"The website server is running, but its Gemini API key is not configured. Follow the setup steps in README.md, then restart the server.";
  status.classList.toggle("service-ready",data.configured);
 }catch(error){
  status.textContent="The AI backend is not available. Start the site with `python server.py` and open http://127.0.0.1:8000.";
  status.classList.remove("service-ready");
 }
}

function showCoachMessages(){
 const output=$("#coach-answer");
 output.replaceChildren();
 coachHistory.forEach(message=>{
  const item=document.createElement("article");
  item.className=`coach-message ${message.role==="user"?"user-message":"assistant-message"}`;
  const heading=document.createElement("b");
  heading.textContent=message.role==="user"?"You":"Gemini";
  item.append(heading);
  if(message.role==="model")item.append(renderCoachMarkdown(message.text));
  else{
   const text=document.createElement("p");
   text.textContent=message.text;
   item.append(text);
  }
  output.append(item);
 });
}

function appendCoachInline(parent,text){
 const pattern=/(\*\*[^*]+\*\*|`[^`]+`)/g;
 let lastIndex=0,match;
 while((match=pattern.exec(text))){
  parent.append(document.createTextNode(text.slice(lastIndex,match.index)));
  const value=match[0];
  const element=document.createElement(value.startsWith("**")?"strong":"code");
  element.textContent=value.startsWith("**")?value.slice(2,-2):value.slice(1,-1);
  parent.append(element);
  lastIndex=pattern.lastIndex;
 }
 parent.append(document.createTextNode(text.slice(lastIndex)));
}

function renderCoachMarkdown(markdown){
 const fragment=document.createDocumentFragment();
 const lines=markdown.replace(/\r\n?/g,"\n").split("\n");
 let paragraph=[];
 const flushParagraph=()=>{
  if(!paragraph.length)return;
  const element=document.createElement("p");
  appendCoachInline(element,paragraph.join(" "));
  fragment.append(element);
  paragraph=[];
 };
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(!line){flushParagraph();continue}
  const heading=line.match(/^(#{1,6})\s+(.+)$/);
  if(heading){
   flushParagraph();
   const element=document.createElement(heading[1].length===3?"h3":"h4");
   appendCoachInline(element,heading[2]);
   fragment.append(element);
   continue;
  }
  const list=line.match(/^(?:[-*+]\s+|\d+[.)]\s+)(.+)$/);
  if(list){
   flushParagraph();
   const ordered=/^\d+[.)]\s+/.test(line);
   const previous=fragment.lastElementChild;
   const listElement=previous&&previous.tagName===(ordered?"OL":"UL")
    ?previous
    :document.createElement(ordered?"ol":"ul");
   if(listElement!==previous)fragment.append(listElement);
   const item=document.createElement("li");
   appendCoachInline(item,list[1]);
   listElement.append(item);
   continue;
  }
  paragraph.push(line);
 }
 flushParagraph();
 return fragment;
}

async function askGemini(){
 if(coachPending)return;
 const question=$("#coach-question").value.trim();
 const button=document.querySelector('[data-act="coach"]');
 const output=$("#coach-answer");
 if(!question){toast("Enter a question for the AI coach.");return}
 if(!$("#ai-consent").checked){toast("Please agree to the AI data-sharing notice first.");return}

 coachPending=true;
 button.disabled=true;
 button.textContent="Gemini is thinking...";
 if(coachHistory.length)showCoachMessages();
 else output.replaceChildren();
 output.setAttribute("aria-busy","true");
 const pending=document.createElement("p");
 pending.className="coach-pending";
 pending.textContent="Generating guidance...";
 output.append(pending);
 try{
  const response=await fetch(`${API_BASE}/api/coach`,{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    consent:true,
    question,
    profile:{
     currentRole:S.role,
     targetRole:S.target,
     careerGoals:S.goals,
     skills:S.skills,
     esgSkills:S.esg
    },
    history:coachHistory.slice(-8)
   })
  });
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"Gemini could not answer. Please try again.");
  coachHistory.push({role:"user",text:question},{role:"model",text:data.answer});
  coachHistory=coachHistory.slice(-8);
  showCoachMessages();
  $("#coach-question").value="";
 }catch(error){
  pending.remove();
  const errorMessage=document.createElement("p");
  errorMessage.className="coach-error";
  errorMessage.textContent=error.message||"Could not reach Gemini. Check the server and try again.";
  output.append(errorMessage);
 }finally{
  coachPending=false;
  button.disabled=false;
  button.textContent="Ask Gemini";
  output.removeAttribute("aria-busy");
 }
}

document.addEventListener("submit",e=>{
 if(e.target.id!=="pf")return;e.preventDefault();
 S.name=$("#n").value.trim();S.role=$("#r").value.trim();S.target=$("#t").value;S.goals=$("#g").value.trim();
 save();location.hash="#skills";
});
document.addEventListener("input",e=>{
 const k=e.target.dataset&&e.target.dataset.k;if(!k)return;
 S.skills[k]=+e.target.value;save();
 e.target.parentElement.querySelector(".lvl").textContent=LV[e.target.value];
});
document.addEventListener("change",e=>{
 const k=e.target.dataset&&e.target.dataset.esgK;if(!k)return;
 if(e.target.value==="")delete S.esg[k];
 else S.esg[k]=+e.target.value;
 save();
 const note=$("#esg-rating-status");
 const rated=esgSummary().rated;
 note.textContent=`${rated} of ${ESG_SKILLS.length} ESG competencies rated. ${ESG_SKILLS.length-rated?`${ESG_SKILLS.length-rated} unrated competencies will not yet affect the analysis.`:"All ESG competencies are included in the analysis."}`;
});
document.addEventListener("click",async e=>{
 const target=e.target.closest("[data-role]");
 if(target){S.target=target.dataset.role;save();location.hash="#gaps";return}
 const question=e.target.closest("[data-question]");
 if(question){$("#coach-question").value=question.dataset.question;$("#coach-question").focus();return}
 const action=e.target.closest("[data-act]");
 const act=action&&action.dataset.act;if(!act)return;
 const a=analyse();
 if(act==="pdf")window.print();
 if(act==="save"){
  try{
   localStorage.setItem("skillgap-growth-plan",JSON.stringify({
    savedAt:new Date().toISOString(),
    profile:JSON.parse(JSON.stringify(S)),
    readiness:a.score,
    priorityGaps:a.gaps.slice(0,3).map(g=>g.k)
   }));
   toast("Growth plan saved on this device.");
   render();
  }catch(error){
   toast("Could not save the growth plan. Check browser storage and try again.");
  }
 }
 if(act==="coach")await askGemini();
 if(act==="share"){
  const text=growthSummary();
  if(navigator.clipboard){
   navigator.clipboard.writeText(text).then(
    ()=>toast("Growth summary copied."),
    ()=>toast("Copy failed. Check clipboard permission and try again.")
   );
  }else{
   window.prompt("Copy this growth summary:",text);
  }
 }
});
render();
