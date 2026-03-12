import{c as n}from"./createLucideIcon.68NEnxef.js";import{r as t}from"./index.B__dpmDM.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16.2V21h-4.8",key:"1hrera"}],["path",{d:"M21 7.8V3h-4.8",key:"ul1q53"}],["path",{d:"M3 16.2V21h4.8",key:"1x04uo"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 7.8V3h4.8",key:"1ijppm"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],p=n("Expand",c);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M8 3H5a2 2 0 0 0-2 2v3",key:"1dcmit"}],["path",{d:"M21 8V5a2 2 0 0 0-2-2h-3",key:"1e4gt3"}],["path",{d:"M3 16v3a2 2 0 0 0 2 2h3",key:"wsl5sc"}],["path",{d:"M16 21h3a2 2 0 0 0 2-2v-3",key:"18trek"}]],u=n("Maximize",i),k=()=>{const[e,h]=t.useState("dark");t.useEffect(()=>{const a=document.documentElement,d=()=>{const r=a.getAttribute("data-theme");r&&h(r)},o=new MutationObserver(d);return o.observe(a,{attributes:!0,attributeFilter:["data-theme"]}),d(),()=>o.disconnect()},[]);const s=t.useMemo(()=>e==="dark"?{bg:"#17181c",nodeBg:"#1f2937",nodeBorder:"#374151",text:"#f3f4f6",edge:"#6366f1",edgeText:"#9ca3af",hairline:"#374151"}:{bg:"#ffffff",nodeBg:"#f3f4f6",nodeBorder:"#d1d5db",text:"#1f2937",edge:"#4f46e5",edgeText:"#4b5563",hairline:"#e5e7eb"},[e]);return{theme:e,colors:s}};export{p as E,u as M,k as u};
