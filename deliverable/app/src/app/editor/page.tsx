"use client";
import { useState } from "react";
import Link from "next/link";

export default function EditorPage() {
  const [title,setTitle]=useState(""); const [summary,setSummary]=useState(""); const [section,setSection]=useState("local"); const [author,setAuthor]=useState("Evoford Journal"); const [status,setStatus]=useState("");
  async function publish(e:React.FormEvent){e.preventDefault();setStatus("Publishing / Publicando…");const r=await fetch("/api/editor/articles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,summary,section,author})});const j=await r.json();if(!r.ok){setStatus(j.error||"Error");return;}setStatus(`Published / Publicado · ${j.url}`);setTitle("");setSummary("");}
  return <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
    <Link href="/" className="font-mono text-xs underline">← Front Page / Portada</Link>
    <header className="mt-8 border-b-2 border-[#1a1a1a] pb-5"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8b0000]">Editorial Desk / Redacción</p><h1 className="mt-2 font-display text-5xl font-bold sm:text-7xl">Nueva publicación</h1><p className="mt-3 text-neutral-600">Escribe una nota propia y publícala directamente en el flujo editorial. Las noticias externas siguen entrando por RSS.</p></header>
    <form onSubmit={publish} className="mt-8 space-y-6">
      <label className="block"><span className="font-mono text-[10px] uppercase tracking-widest">Title / Título</span><input required value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full border-b-2 border-[#1a1a1a] bg-transparent px-1 py-3 font-display text-3xl outline-none" placeholder="Headline / Titular"/></label>
      <label className="block"><span className="font-mono text-[10px] uppercase tracking-widest">Summary / Resumen</span><textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={5} className="mt-2 w-full border border-[#ccc] bg-transparent p-3 text-base outline-none" placeholder="Short editorial summary / breve resumen"/></label>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block"><span className="font-mono text-[10px] uppercase tracking-widest">Section / Sección</span><select value={section} onChange={e=>setSection(e.target.value)} className="mt-2 w-full border border-[#ccc] bg-[#fcfbf7] p-3"><option value="local">República Dominicana</option><option value="equities">Latinoamérica / Mundo</option><option value="finance">Economía</option><option value="tech">Tecnología</option><option value="fitness">Sociedad / Ciencia</option><option value="sports">Deportes</option></select></label><label className="block"><span className="font-mono text-[10px] uppercase tracking-widest">Author / Autor</span><input value={author} onChange={e=>setAuthor(e.target.value)} className="mt-2 w-full border border-[#ccc] bg-transparent p-3"/></label></div>
      <button className="border-2 border-[#1a1a1a] bg-[#1a1a1a] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-[#8b0000]">Publish / Publicar</button>
      {status && <p className="font-mono text-xs text-neutral-600">{status}</p>}
    </form>
  </main>;
}
