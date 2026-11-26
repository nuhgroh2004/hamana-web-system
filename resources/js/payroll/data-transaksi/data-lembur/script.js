const initPayrollDataLemburRoots = new WeakSet();

function initPayrollDataLembur() {
    const root = document.getElementById('payroll-data-lembur');

    if (!root || initPayrollDataLemburRoots.has(root)) {
        return;
    }

    initPayrollDataLemburRoots.add(root);
    var KEY="data-lembur-v1";
      var $=function(i){return document.getElementById(i)};
      // Daftar karyawan (ganti dengan data dari server)
      var EMP=[{nik:"0926.27.01.06",nama:"M. ALI AGUNG MULYANA ADI SAPUTRA",jab:"Driver"},{nik:"0221.03.01.06",nama:"M. KRISNA AJI PANGESTU",jab:"Officer"}];
      var MON=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      var SEED=[
        {id:"s1",nik:EMP[0].nik,nama:EMP[0].nama,jab:"Driver",tgl:"2026-11-12",tipe:"Work Day",mulai:"06:54:00",selesai:"18:00:00",ot:"4.42",input:"2026-11-20 06:08:39 WIB"},
        {id:"s2",nik:EMP[1].nik,nama:EMP[1].nama,jab:"Officer",tgl:"2026-11-11",tipe:"Work Day",mulai:"05:30:00",selesai:"20:30:00",ot:"11.50",input:"2026-11-20 06:08:39 WIB"},
        {id:"s3",nik:EMP[1].nik,nama:EMP[1].nama,jab:"Officer",tgl:"2026-11-05",tipe:"Work Day",mulai:"05:00:00",selesai:"20:00:00",ot:"11.50",input:"2026-11-20 06:08:39 WIB"}
      ];
      var D=null;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){}
      if(!D)D=SEED;
      var pend=[],editId=null,cf=null,ct=null,now=new Date();
      function p2(n){return String(n).padStart(2,"0")}
      function iso(d){return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())}
      function dmy(s){var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
      function stamp(){return iso(now=new Date())+" "+p2(now.getHours())+":"+p2(now.getMinutes())+":"+p2(now.getSeconds())+" WIB"}
      function esc(v){return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
      function say(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.t);t.t=setTimeout(function(){t.classList.remove("on")},2600)}
      function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
      function err(k,m){var f=document.querySelector('[data-f="'+k+'"]');f.classList.toggle("bad",!!m);var e=f.querySelector(".er");if(e)e.textContent=m||""}
      // Aturan sementara: selisih Jam Pulang - Jam Masuk (jam desimal). Ganti sesuai aturan perhitungan sistem Anda.
      function hitungOvertime(m,p){var a=m.split(":"),b=p.split(":"),d=(+b[0]*60+ +b[1])-(+a[0]*60+ +a[1]);if(d<0)d+=1440;return (d/60).toFixed(2)}

      $("emp").innerHTML='<option value="">--Pilih Karyawan--</option>'+EMP.map(function(e,i){return '<option value="'+i+'">'+esc(e.nama)+'</option>'}).join("");
      $("bl").innerHTML=MON.map(function(m,i){return '<option value="'+(i+1)+'">'+m+'</option>'}).join("");
      var ys="";for(var y=now.getFullYear()-3;y<=now.getFullYear()+1;y++)ys+='<option>'+y+'</option>';$("th").innerHTML=ys;
      function defForm(){$("emp").value="";$("tgl").value=iso(now=new Date());var t=p2(now.getHours())+":"+p2(now.getMinutes());$("jm").value=t;$("jp").value=t;["emp","tgl","jm","jp"].forEach(function(k){err(k,"")})}
      function defFilter(){$("q").value="";$("bl").value=now.getMonth()+1;$("th").value=now.getFullYear();$("d1").value="";$("d2").value=""}
      defForm();defFilter();

      var ED='<svg class="i" viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-8 8H2.5v-3z"/></svg>',
          RM='<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';

      function list(){
        var q=$("q").value.trim().toLowerCase(),a=$("d1").value,b=$("d2").value,m=p2($("bl").value),y=$("th").value;
        return D.filter(function(r){
          if(q&&r.nama.toLowerCase().indexOf(q)<0&&r.nik.toLowerCase().indexOf(q)<0)return false;
          if(a||b)return (!a||r.tgl>=a)&&(!b||r.tgl<=b);
          return r.tgl.slice(0,4)===y&&r.tgl.slice(5,7)===m;
        }).sort(function(x,z){return x.tgl<z.tgl?1:x.tgl>z.tgl?-1:0});
      }
      function render(){
        var L=list();
        $("tb").innerHTML=L.length?L.map(function(r,i){
          return '<tr><td class="no">'+(i+1)+'</td><td class="dt"><div class="nik">'+esc(r.nik)+'</div><div class="nm">'+esc(r.nama)+'</div><div class="jb">'+esc(r.jab)+'</div></td>'+
            '<td data-l="Tanggal" class="nw n">'+dmy(r.tgl)+'</td><td data-l="Tipe"><span class="tp">'+esc(r.tipe)+'</span></td>'+
            '<td data-l="Mulai" class="n">'+r.mulai+'</td><td data-l="Selesai" class="n">'+r.selesai+'</td><td data-l="Overtime" class="n">'+esc(r.ot)+'</td>'+
            '<td data-l="Tgl. Input" class="nw n">'+esc(r.input)+'</td><td class="ac">'+
            '<button type="button" class="ib" data-e="'+r.id+'" title="Edit" aria-label="Edit">'+ED+'</button>'+
            (cf===r.id?'<button type="button" class="ib cf" data-d="'+r.id+'">Yakin?</button>':'<button type="button" class="ib rm" data-d="'+r.id+'" title="Hapus" aria-label="Hapus">'+RM+'</button>')+
            '</td></tr>';
        }).join(""):'<tr class="er"><td colspan="9" class="empty" style="display:block;text-align:center">Tidak ada data lembur.</td></tr>';
      }
      function renderPend(){
        $("pend").hidden=!pend.length;
        $("ph").textContent=pend.length+" tanggal akan disimpan";
        $("pl").innerHTML=pend.map(function(x,i){return '<div class="pi"><span><b>'+dmy(x.tgl)+'</b><em>'+x.m+' – '+x.p+'</em></span><button type="button" class="ib rm" data-x="'+i+'" title="Hapus" aria-label="Hapus">'+RM+'</button></div>'}).join("");
      }
      function valid(needTime){
        var bad=0;
        if($("emp").value===""){err("emp","Pilih karyawan.");bad++}else err("emp","");
        if(!$("tgl").value){err("tgl","");document.querySelector('[data-f="tgl"] .fld').style.borderColor="var(--err)";bad++}else document.querySelector('[data-f="tgl"] .fld').style.borderColor="";
        if(!$("jm").value||!$("jp").value)bad++;
        if(bad)say(!$("emp").value&&bad===1?"Pilih karyawan terlebih dahulu.":"Lengkapi karyawan, tanggal, dan jam.");
        return !bad;
      }
      $("emp").onchange=function(){err("emp","")};
      $("add").onclick=function(){
        if(!valid())return;
        var t=$("tgl").value;pend=pend.filter(function(x){return x.tgl!==t});
        pend.push({tgl:t,m:$("jm").value,p:$("jp").value});pend.sort(function(a,b){return a.tgl<b.tgl?-1:1});
        renderPend();say("Tanggal "+dmy(t)+" ditambahkan.");
      };
      $("pl").addEventListener("click",function(e){var b=e.target.closest("[data-x]");if(b){pend.splice(+b.dataset.x,1);renderPend()}});
      function reset(){editId=null;pend=[];renderPend();defForm();$("t1").textContent="Tambah lembur karyawan";$("add").hidden=false;$("sub").textContent="Submit"}
      $("rs").onclick=reset;
      $("sub").onclick=function(){
        if(!valid())return;
        var e=EMP[+$("emp").value],items=pend.length&&!editId?pend.slice():[{tgl:$("tgl").value,m:$("jm").value,p:$("jp").value}],n=0;
        items.forEach(function(x){
          var rec={id:Date.now().toString(36)+(n++),nik:e.nik,nama:e.nama,jab:e.jab,tgl:x.tgl,tipe:"Work Day",mulai:x.m+":00",selesai:x.p+":00",ot:hitungOvertime(x.m,x.p),input:stamp()};
          if(editId){D=D.filter(function(r){return r.id!==editId});}
          // karyawan dan tanggal sama: data lama ditimpa
          D=D.filter(function(r){return !(r.nik===rec.nik&&r.tgl===rec.tgl)});
          D.push(rec);document.dispatchEvent(new CustomEvent("lembur-save",{detail:rec}));
        });
        save();var f=items[items.length-1].tgl;$("bl").value=+f.slice(5,7);$("th").value=f.slice(0,4);$("d1").value="";$("d2").value="";
        say(editId?"Data lembur diperbarui.":items.length+" data lembur disimpan.");reset();render();
      };
      $("tb").addEventListener("click",function(ev){
        var ed=ev.target.closest("[data-e]"),d=ev.target.closest("[data-d]");
        if(ed){var r=D.filter(function(x){return x.id===ed.dataset.e})[0];editId=r.id;pend=[];renderPend();
          var i=EMP.findIndex(function(e){return e.nik===r.nik});$("emp").value=i>-1?i:"";
          $("tgl").value=r.tgl;$("jm").value=r.mulai.slice(0,5);$("jp").value=r.selesai.slice(0,5);
          $("t1").textContent="Edit lembur karyawan";$("add").hidden=true;$("sub").textContent="Simpan Perubahan";scrollTo({top:0,behavior:"smooth"})}
        else if(d){var id=d.dataset.d;
          if(cf===id){var g=D.filter(function(x){return x.id===id})[0];D=D.filter(function(x){return x.id!==id});cf=null;clearTimeout(ct);if(editId===id)reset();save();render();say("Data lembur dihapus.");document.dispatchEvent(new CustomEvent("lembur-delete",{detail:g}))}
          else{cf=id;render();clearTimeout(ct);ct=setTimeout(function(){cf=null;render()},3000)}}
      });

      ["q","bl","th","d1","d2"].forEach(function(k){$(k).addEventListener("input",function(){cf=null;render()})});
      $("show").onclick=render;
      $("rl").onclick=function(){defFilter();cf=null;render();say("Data dimuat ulang.")};
      $("exp").onclick=function(){document.dispatchEvent(new CustomEvent("lembur-export-rekap",{detail:{data:list()}}));say("Menyiapkan export rekap rupiah...")};

      $("tpl").onclick=function(){
        var u=URL.createObjectURL(new Blob(["\ufeffNIK,Nama Karyawan,Tanggal,Jam Masuk,Jam Pulang\n"],{type:"text/csv"})),a=document.createElement("a");
        a.href=u;a.download="template-lembur.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);
      };
      $("imp").onclick=function(){
        var f=$("file").files[0];if(!f){say("Pilih file terlebih dahulu.");return}
        document.dispatchEvent(new CustomEvent("lembur-import",{detail:f}));say("Mengimpor "+f.name+"...");
      };
      render();renderPend();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollDataLembur);
} else {
    initPayrollDataLembur();
}

document.addEventListener('livewire:navigated', initPayrollDataLembur);
