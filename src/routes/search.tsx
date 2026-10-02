import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";
export const Route=createFileRoute("/search")({head:()=>({meta:[{title:"Search Jewellery | Twinklingz"},{name:"description",content:"Search the Twinklingz jewellery collection."},{property:"og:title",content:"Search Jewellery | Twinklingz"},{property:"og:description",content:"Find your next favourite piece."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}),component:Page});
function Page(){const [q,setQ]=useState("");const found=products.filter(p=>`${p.name} ${p.category}`.toLowerCase().includes(q.toLowerCase()));return <main className="min-h-screen px-5 pb-24 pt-36 lg:px-10"><div className="mx-auto max-w-7xl"><h1 className="font-display text-5xl">Find your sparkle</h1><div className="mt-8 flex max-w-2xl border-b border-primary"><Search className="mt-3"/><input value={q} onChange={e=>setQ(e.target.value)} autoFocus placeholder="Search by product, category, material or colour" className="w-full bg-transparent p-3 outline-none"/></div><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{found.map(p=><ProductCard key={p.id} product={p}/>)}</div></div></main>}
