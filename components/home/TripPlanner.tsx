'use client';
import { FormEvent, useState } from 'react';
import { Check, ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import type { PlannerLabels } from './TripPlannerSection';

export type PlannerStep = {
  id: string;
  question?: string;
  fieldKey?: string;
  choices: { value: string; label: string }[];
};

export default function TripPlanner({ steps, labels }: { steps: PlannerStep[]; labels: PlannerLabels }) {
  const [step,setStep]=useState(0); const [answers,setAnswers]=useState<string[]>([]);
  const [form,setForm]=useState({name:'',email:'',phone:''}); const [done,setDone]=useState(false);
  const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const totalSteps=steps.length+1;
  const choose=(value:string)=>{setAnswers(a=>{const next=[...a];next[step]=value;return next});setStep(v=>v+1)};
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!form.name||!form.email||!form.phone){setError(labels.validationMessage||'');return;}
    setLoading(true);setError('');
    const preferences=Object.fromEntries(steps.map((s,i)=>[s.fieldKey||s.id,answers[i]]).filter(([,answer])=>answer));
    const destinationStep=steps.findIndex(s=>s.fieldKey==='destination');
    try{
      await apiFetch('/enquiries',{method:'POST',data:{
        name:form.name,email:form.email,phone:form.phone,
        destination:destinationStep>=0?answers[destinationStep]:undefined,
        source:'trip-planner',
        message:steps.map((s,i)=>answers[i]?`${s.question||s.fieldKey||''}: ${answers[i]}`:'').filter(Boolean).join('; '),
        preferences,
      }});
      setDone(true);
    }catch(e:any){setError(e.message||labels.validationMessage||'');}finally{setLoading(false)}
  };
  const reset=()=>{setStep(0);setAnswers([]);setForm({name:'',email:'',phone:''});setDone(false);setError('')};
  const heading=step<steps.length?steps[step].question:labels.contactStepTitle;
  const firstUnanswered=steps.findIndex((_,i)=>!answers[i]);
  const reachable=firstUnanswered===-1?steps.length:firstUnanswered;
  const backButton=<button type="button" onClick={()=>setStep(v=>Math.max(0,v-1))} className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition hover:border-[#b76b43]"><ArrowLeft size={15}/>{labels.backLabel&&<> {labels.backLabel}</>}</button>;
  return <section className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1180px] overflow-hidden rounded-[30px] border border-[#e9e1d7] bg-white shadow-[0_24px_80px_rgba(35,29,24,.13)]">
    {done ? <div className="px-5 py-14 text-center sm:px-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#b76b43] text-white"><Check/></div>{labels.successEyebrow&&<p className="mt-6 text-[10px] font-bold uppercase tracking-[.24em] text-[#a35b36]">{labels.successEyebrow}</p>}{labels.successTitle&&<h2 className="mt-3 font-serif text-4xl">{labels.successTitle}</h2>}{labels.successMessage&&<p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/55">{labels.successMessage}</p>}{labels.resetLabel&&<button onClick={reset} className="mt-7 rounded-full border px-6 py-3 text-sm">{labels.resetLabel}</button>}</div>
    : <><div className="px-5 pt-7 sm:px-9"><div className="flex items-center justify-between"><div>{labels.eyebrow&&<p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#a35b36]"><Sparkles size={13}/> {labels.eyebrow}</p>}{heading&&<h2 className="mt-2 font-serif text-3xl">{heading}</h2>}</div><div className="flex shrink-0 items-center gap-3">{answers.some(Boolean)&&<button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-black/55 transition hover:text-[#a35b36]"><RotateCcw size={13}/> Start over</button>}<span className="rounded-full bg-[#faf8f4] px-3 py-1.5 text-xs">{Math.min(step+1,totalSteps)} / {totalSteps}</span></div></div>
        <div className="mt-3 flex gap-1.5">{Array.from({length:totalSteps},(_,i)=><button key={i} type="button" disabled={i>reachable} onClick={()=>setStep(i)} aria-label={`Go to step ${i+1}`} aria-current={i===step?'step':undefined} className="flex-1 py-2 disabled:cursor-not-allowed"><span className={`block h-1.5 rounded-full transition ${i<=step?'bg-[#b76b43]':i<=reachable?'bg-[#b76b43]/35 hover:bg-[#b76b43]/60':'bg-[#eee8df]'}`}/></button>)}</div></div>
      {step<steps.length ? <div className="px-5 py-8 sm:px-9"><div className="grid gap-3 sm:grid-cols-2">{steps[step].choices.map(choice=>{const selected=answers[step]===choice.value;return <button key={choice.value} type="button" aria-pressed={selected} onClick={()=>choose(choice.value)} className={`group relative rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-[#b76b43] hover:bg-[#faf8f4] ${selected?'border-[#b76b43] bg-[#faf8f4] ring-1 ring-[#b76b43]':'border-[#e8e1d8]'}`}><span className="text-sm font-medium">{choice.label}</span>{selected?<span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#b76b43] text-white"><Check size={14}/></span>:null}<ArrowRight size={15} className="mt-3 text-[#b76b43] transition group-hover:translate-x-1"/></button>})}</div>{step>0&&<div className="mt-6">{backButton}</div>}</div>
      : <form onSubmit={submit} className="px-5 py-8 sm:px-9"><div className="grid gap-4 sm:grid-cols-3"><input required placeholder={labels.namePlaceholder} aria-label={labels.namePlaceholder} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="rounded-xl border p-3"/><input required placeholder={labels.emailPlaceholder} aria-label={labels.emailPlaceholder} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="rounded-xl border p-3"/><input required placeholder={labels.phonePlaceholder} aria-label={labels.phonePlaceholder} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="rounded-xl border p-3"/></div>{error&&<p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-between">{backButton}<button type="submit" disabled={loading} className="rounded-full bg-[#b76b43] px-6 py-3 text-sm text-white disabled:opacity-50">{loading?(labels.submittingLabel??labels.submitLabel):labels.submitLabel}</button></div></form>}
    </>}
  </div></section>;
}
