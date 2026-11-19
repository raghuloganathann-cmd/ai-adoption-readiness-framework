const DIMS = [
 {k:"Strategy",d:"Direction and business case",qs:["We have named business problems where AI could create value.","Leadership actively sponsors AI initiatives.","AI goals are tied to measurable outcomes and a budget."],
  rec:["List three high-value use cases and score them by impact and effort.","Assign an executive sponsor and set one measurable target per use case.","Fund a small pilot before committing to a large program."]},
 {k:"Data",d:"Quality and access",qs:["Our key data is accurate, complete and documented.","Teams can find and access the data they need quickly.","We have clear ownership for each major data set."],
  rec:["Inventory the data sets behind your top use cases and rate their quality.","Name a data owner for each critical data set.","Create a shared catalog so teams can discover and request data."]},
 {k:"Technology",d:"Tools and infrastructure",qs:["We have scalable cloud or compute resources for AI workloads.","Our systems can connect to AI tools through APIs.","We can deploy, monitor and update models in production."],
  rec:["Audit which systems expose APIs and close the integration gaps.","Choose a standard environment for experiments and deployment.","Set up monitoring for model quality, cost and uptime."]},
 {k:"Talent",d:"Skills and capacity",qs:["We have people who can build or configure AI solutions.","Non-technical staff know how to use AI tools well.","We have a plan to train and hire for AI skills."],
  rec:["Run a skills survey to find gaps by role.","Offer hands-on training with real work tasks, not only theory.","Form a small cross-functional team to lead early projects."]},
 {k:"Governance",d:"Risk, ethics and compliance",qs:["We have an AI use policy that employees know about.","We assess privacy, security and bias risks before launch.","Someone is accountable for AI decisions and incidents."],
  rec:["Publish a short acceptable-use policy for AI tools.","Add a risk checklist to every AI project before launch.","Define an escalation path and an accountable owner."]},
 {k:"Culture",d:"Openness and change",qs:["Employees are curious about AI and willing to try it.","Teams can run small experiments without heavy approvals.","We share results and lessons from AI projects openly."],
  rec:["Start with quick wins that save people real time.","Create a lightweight way to approve and run experiments.","Hold a regular show-and-tell for AI results, including failures."]}
];
const LEVELS = [
 {max:25,n:"Exploring",t:"AI is not yet part of how you work. Focus on awareness, a first use case and basic policies."},
 {max:50,n:"Developing",t:"You have pockets of interest or early pilots. Build shared foundations before scaling."},
 {max:75,n:"Established",t:"You have the core pieces in place. Concentrate on scaling what works and closing the weakest gaps."},
 {max:101,n:"Leading",t:"AI is embedded across the organization. Keep improving governance, measurement and reuse."}
];
const LABELS=["1","2","3","4","5"];
const $=id=>document.getElementById(id);
const form=$("form");
let n=0;
DIMS.forEach((d,i)=>{
  const fs=document.createElement("fieldset");
  fs.innerHTML=`<legend>${d.k}</legend><p class="dim-note">${d.d}</p>`;
  d.qs.forEach((q,j)=>{
    const name=`q${i}_${j}`; n++;
    const div=document.createElement("div");div.className="q";
    div.innerHTML=`<p>${q}</p><div class="scale" role="radiogroup" aria-label="${q}">${LABELS.map(v=>`<label><input type="radio" name="${name}" value="${v}"><span>${v}</span></label>`).join("")}</div><div class="ends"><span>Not at all</span><span>Fully</span></div>`;
    fs.appendChild(div);
  });
  form.appendChild(fs);
});
function answered(){return form.querySelectorAll("input:checked").length}
form.addEventListener("change",()=>{
  const a=answered();
  $("fill").style.width=(a/n*100)+"%";
  $("count").textContent=`${a} of ${n} answered`;
  $("submit").disabled=a<n;
  $("hint").style.display=a<n?"":"none";
});
function compute(){
  return DIMS.map((d,i)=>{
    const vals=d.qs.map((_,j)=>+form.elements[`q${i}_${j}`].value);
    const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    return {k:d.k,pct:Math.round((avg-1)/4*100),rec:d.rec};
  });
}
function radar(res){
  const cx=200,cy=180,R=120,N=res.length;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/N;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  let s="";
  [.25,.5,.75,1].forEach(f=>{s+=`<polygon points="${res.map((_,i)=>pt(i,R*f).join(",")).join(" ")}" fill="none" stroke="var(--line)"/>`});
  res.forEach((_,i)=>{const [x,y]=pt(i,R);s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`});
  s+=`<polygon points="${res.map((r,i)=>pt(i,Math.max(R*r.pct/100,2)).join(",")).join(" ")}" fill="var(--accent)" fill-opacity=".28" stroke="var(--accent)" stroke-width="2.5"/>`;
  res.forEach((r,i)=>{
    const [x,y]=pt(i,Math.max(R*r.pct/100,2));s+=`<circle cx="${x}" cy="${y}" r="4" fill="var(--accent)"/>`;
    const [lx,ly]=pt(i,R+22);const anchor=Math.abs(lx-cx)<10?"middle":lx>cx?"start":"end";
    s+=`<text x="${lx}" y="${ly+4}" text-anchor="${anchor}">${r.k}</text>`;
  });
  $("radar").innerHTML=s;
}
$("submit").addEventListener("click",()=>{
  const res=compute();
  const total=Math.round(res.reduce((a,r)=>a+r.pct,0)/res.length);
  const lv=LEVELS.find(l=>total<l.max);
  $("score").textContent=total+"%";
  $("lvl").textContent=lv.n;
  $("lvlText").textContent=lv.t;
  radar(res);
  $("bars").innerHTML=`<h3 style="margin-bottom:8px">Score by area</h3>`+res.map(r=>`<div class="row ${r.pct<50?"low":""}"><span>${r.k}</span><div class="t"><div class="f" style="width:${r.pct}%"></div></div><b>${r.pct}%</b></div>`).join("");
  const weakest=[...res].sort((a,b)=>a.pct-b.pct).slice(0,2);
  $("recs").innerHTML=`<h3 style="margin-bottom:10px">Where to focus first</h3>`+weakest.map(w=>`<h3 style="font-size:1rem;margin:12px 0 4px">${w.k} (${w.pct}%)</h3><ul>${w.rec.map(x=>`<li>${x}</li>`).join("")}</ul>`).join("");
  $("quiz").style.display="none";
  $("results").style.display="block";
  window.scrollTo(0,0);
});
$("redo").addEventListener("click",()=>{
  form.reset();form.dispatchEvent(new Event("change"));
  $("results").style.display="none";
  $("quiz").style.display="block";
  window.scrollTo(0,0);
});
