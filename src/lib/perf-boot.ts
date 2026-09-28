// Decides lite mode before first paint; see lib/perf.ts for what it means.
/** Runs before first paint (inlined in <head>). Keep it tiny and ES5. */
export const PERF_BOOT_SCRIPT = `try{var d=document.documentElement,n=navigator,c=n.connection||{},m=n.deviceMemory||8,k=n.hardwareConcurrency||8;
if(sessionStorage.getItem('intro-seen'))d.classList.add('intro-seen');
var slow=c.saveData||/2g|3g/.test(c.effectiveType||'');
var weak=m<=2||k<=2||(m<=4&&k<=4);
var saved=localStorage.getItem('perf-mode');
if(saved!=='full'&&(saved==='lite'||slow||weak||matchMedia('(prefers-reduced-motion: reduce)').matches))d.classList.add('lite');
if(slow){d.classList.add('slow-net','intro-seen');}}catch(e){}`;
