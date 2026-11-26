const initPayrollGeneratePayrollRoots = new WeakSet();

function initPayrollGeneratePayroll() {
    const root = document.getElementById('payroll-generate-payroll');

    if (!root || initPayrollGeneratePayrollRoots.has(root)) {
        return;
    }

    initPayrollGeneratePayrollRoots.add(root);
    var KEY="generate-payroll-v1",USER="Administrator";
      var $=function(i){return document.getElementById(i)};
      var rows=[],open=null,editId=null,cur=null;
      try{rows=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){}
      function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
      function parse(s){var p=s.split("-");return new Date(+p[0],p[1]-1,+p[2])}
      function tgl(s){return parse(s).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}
      function bulan(s){return parse(s).toLocaleDateString("id-ID",{month:"long",year:"numeric"})}
      function waktu(t){var d=new Date(t);return d.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})+", "+d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",hour12:false}).replace(".",":")}
      function esc(v){return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
      function save(){try{localStorage.setItem(KEY,JSON.stringify(rows))}catch(e){}}
      function say(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.t);t.t=setTimeout(function(){t.classList.remove("on")},2400)}
      function defaults(){var n=new Date();$("dr").value=iso(new Date(n.getFullYear(),n.getMonth()-1,15));$("sd").value=iso(new Date(n.getFullYear(),n.getMonth(),16));label()}
      function label(){$("bln").textContent=$("sd").value?bulan($("sd").value):"-"}

      function render(){
        $("tb").innerHTML=rows.length?rows.map(function(r){
          var h='<tr><td class="ac"><button type="button" class="btn sm" data-m="'+r.id+'" aria-haspopup="true">Aksi <svg class="i" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg></button></td>'+
            '<td data-l="Di-generate Oleh">'+esc(r.user)+'</td>'+
            '<td data-l="Periode">'+tgl(r.dari)+' <span class="mute">&nbsp;s/d&nbsp;</span> '+tgl(r.sampai)+'</td>'+
            '<td data-l="Label Bulan"><span class="lbl">'+bulan(r.sampai)+'</span></td>'+
            '<td data-l="Waktu Generate" class="mute">'+waktu(r.at)+'</td></tr>';
          if(open===r.id)h+='<tr class="dt"><td colspan="5"><b>Detail:</b> Payroll periode '+tgl(r.dari)+' sampai '+tgl(r.sampai)+' ('+bulan(r.sampai)+'), di-generate oleh <b>'+esc(r.user)+'</b> pada '+waktu(r.at)+'.</td></tr>';
          return h;
        }).join(""):'<tr class="empty-r"><td colspan="5" class="empty" style="display:block;text-align:center">Belum ada payroll yang di-generate.</td></tr>';
      }

      function reset(){editId=null;$("gt").textContent="Generate";$("ttl").textContent="Periode Payroll";defaults()}
      $("dr").oninput=$("sd").oninput=label;
      $("go").onclick=function(){
        var a=$("dr").value,b=$("sd").value;
        if(!a||!b){say("Tanggal wajib diisi.");return}
        if(a>b){say("Tanggal awal tidak boleh melebihi tanggal akhir.");return}
        var r;
        if(editId){r=rows.filter(function(x){return x.id===editId})[0];r.dari=a;r.sampai=b;r.at=Date.now();say("Payroll berhasil diperbarui.")}
        else{r={id:Date.now().toString(36),user:USER,dari:a,sampai:b,at:Date.now()};rows.unshift(r);say("Payroll "+bulan(b)+" berhasil di-generate.")}
        save();render();reset();
        document.dispatchEvent(new CustomEvent("payroll-generate",{detail:r}));
      };

      var mn=$("mn");
      $("tb").addEventListener("click",function(e){
        var b=e.target.closest("[data-m]");if(!b)return;
        e.stopPropagation();
        if(!mn.hidden&&cur===b.dataset.m){mn.hidden=true;return}
        cur=b.dataset.m;mn.hidden=false;
        var r=b.getBoundingClientRect(),w=mn.offsetWidth,h=mn.offsetHeight;
        mn.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+"px";
        mn.style.top=(r.bottom+h+8>innerHeight?r.top-h-4:r.bottom+4)+"px";
      });
      mn.addEventListener("click",function(e){
        var b=e.target.closest("[data-a]");if(!b)return;
        var a=b.dataset.a,r=rows.filter(function(x){return x.id===cur})[0];mn.hidden=true;if(!r)return;
        if(a==="view"){open=open===r.id?null:r.id;render()}
        else if(a==="edit"){editId=r.id;$("dr").value=r.dari;$("sd").value=r.sampai;label();$("gt").textContent="Simpan Perubahan";$("ttl").textContent="Edit Periode Payroll";scrollTo({top:0,behavior:"smooth"});$("dr").focus({preventScroll:true})}
        else{rows=rows.filter(function(x){return x.id!==r.id});if(editId===r.id)reset();if(open===r.id)open=null;save();render();say("Data payroll dihapus.");document.dispatchEvent(new CustomEvent("payroll-delete",{detail:r}))}
      });
      document.addEventListener("click",function(){mn.hidden=true});
      addEventListener("scroll",function(){mn.hidden=true},true);
      addEventListener("resize",function(){mn.hidden=true});

      defaults();render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollGeneratePayroll);
} else {
    initPayrollGeneratePayroll();
}

document.addEventListener('livewire:navigated', initPayrollGeneratePayroll);
