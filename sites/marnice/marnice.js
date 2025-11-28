document.addEventListener('DOMContentLoaded',()=>{
  const btn=document.getElementById('copyAddress');
  if(!btn) return;
  btn.addEventListener('click',async()=>{
    const addr=document.querySelector('.address')?.innerText||'';
    try{
      await navigator.clipboard.writeText(addr);
      btn.textContent='Zkopírováno';
      setTimeout(()=>btn.textContent='Zkopírovat adresu',1500);
    }catch(e){
      const ta=document.createElement('textarea');ta.value=addr;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
      btn.textContent='Zkopírováno';setTimeout(()=>btn.textContent='Zkopírovat adresu',1500);
    }
  });
});
