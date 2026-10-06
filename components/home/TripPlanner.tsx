'use client';
import { FormEvent, useState } from 'react';
import { Check, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
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
  return <section className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1180px] overflow-hidden rounded-[30px] border border-[#e9e1d7] bg-white shadow-[0_24px_80px_rgba(35,29,24,.13)]">
    {done ? <div className="px-5 py-14 text-center sm:px-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#b76b43] text-white"><Check/></div>{labels.successEyebrow&&<p className="mt-6 text-[10px] font-bold uppercase tracking-[.24em] text-[#a35b36]">{labels.successEyebrow}</p>}{labels.successTitle&&<h2 className="mt-3 font-serif text-4xl">{labels.successTitle}</h2>}{labels.successMessage&&<p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/55">{labels.successMessage}</p>}{labels.resetLabel&&<button onClick={reset} className="mt-7 rounded-full border px-6 py-3 text-sm">{labels.resetLabel}</button>}</div>
    : <><div className="px-5 pt-7 sm:px-9"><div className="flex items-center justify-between"><div>{labels.eyebrow&&<p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#a35b36]"><Sparkles size={13}/> {labels.eyebrow}</p>}{heading&&<h2 className="mt-2 font-serif text-3xl">{heading}</h2>}</div><span className="rounded-full bg-[#faf8f4] px-3 py-1.5 text-xs">{Math.min(step+1,totalSteps)} / {totalSteps}</span></div><div className="mt-5 h-1 rounded-full bg-[#eee8df]"><div className="h-1 rounded-full bg-[#b76b43] transition-all" style={{width:`${Math.min(step+1,totalSteps)/totalSteps*100}%`}}/></div></div>
      {step<steps.length ? <div className="grid gap-3 px-5 py-8 sm:grid-cols-2 sm:px-9">{steps[step].choices.map(choice=><button key={choice.value} onClick={()=>choose(choice.value)} className="group rounded-2xl border border-[#e8e1d8] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#b76b43] hover:bg-[#faf8f4]"><span className="text-sm font-medium">{choice.label}</span><ArrowRight size={15} className="mt-3 text-[#b76b43] transition group-hover:translate-x-1"/></button>)}</div>
      : <form onSubmit={submit} className="px-5 py-8 sm:px-9"><div className="grid gap-4 sm:grid-cols-3"><input required placeholder={labels.namePlaceholder} aria-label={labels.namePlaceholder} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="rounded-xl border p-3"/><input required placeholder={labels.emailPlaceholder} aria-label={labels.emailPlaceholder} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="rounded-xl border p-3"/><input required placeholder={labels.phonePlaceholder} aria-label={labels.phonePlaceholder} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="rounded-xl border p-3"/></div>{error&&<p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-between"><button type="button" onClick={()=>setStep(v=>Math.max(0,v-1))} className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm"><ArrowLeft size={15}/>{labels.backLabel&&<> {labels.backLabel}</>}</button><button type="submit" disabled={loading} className="rounded-full bg-[#b76b43] px-6 py-3 text-sm text-white disabled:opacity-50">{loading?(labels.submittingLabel??labels.submitLabel):labels.submitLabel}</button></div></form>}
    </>}
  </div></section>;
}
