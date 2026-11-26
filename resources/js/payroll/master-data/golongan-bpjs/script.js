const initPayrollGolonganBpjsRoots = new WeakSet();

function initPayrollGolonganBpjs() {
    const root = document.getElementById('payroll-golongan-bpjs');

    if (!root || initPayrollGolonganBpjsRoots.has(root)) {
        return;
    }

    initPayrollGolonganBpjsRoots.add(root);
    var KEY="golongan-bpjs-v1";
      var $=function(i){return document.getElementById(i)};
      var C=[["jkk","JKK","JKK (Jaminan Kecelakaan Kerja)"],["jkm","JKM","JKM (Jaminan Kematian)"],["jht","JHT","JHT (Jaminan Hari Tua)"],["jp","JP","JP (Jaminan Pensiun)"],["reg","BPJS Regular","BPJS Kesehatan Regular"]];
      var SEED=[
        {kode:"1",nama:"Golongan 1",c:{jkk:1},ket:"Dipotong hanya Jaminan Keselamatan Kerja (JKK)"},
        {kode:"2",nama:"Golongan 2",c:{jkk:1,jkm:1,jht:1,reg:1},ket:"Di potong hanya JKK, JK, JHT dan BPJS Regular Karyawan"},
        {kode:"3",nama:"Golongan 3",c:{jkk:1,jkm:1,jht:1,jp:1,reg:1},ket:"JKK, JK, JHT, JP dan BPJS Regular"},
        {kode:"4",nama:"Golongan 4",c:{},ket:"devlopmen untuk awal"}
      ];
      var D=null;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){}
      if(!D)D=SEED;
      var editKode=null,cf=null,ct=null;
      var OK='<svg class="i ok" viewBox="0 0 16 16" role="img" aria-label="Termasuk"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>',
          NO='<svg class="i no" viewBox="0 0 16 16" role="img" aria-label="Tidak termasuk"><path d="M4 8h8"/></svg>',
          ED='<svg class="i" viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-8 8H2.5v-3z"/></svg>',
          RM='<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';
      function esc(v){return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
      function say(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.t);t.t=setTimeout(function(){t.classList.remove("on")},2400)}
      function err(k,m){var f=document.querySelector('[data-f="'+k+'"]');f.classList.toggle("bad",!!m);f.querySelector(".er").textContent=m||""}
      function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}

      $("chips").innerHTML=C.map(function(c){return '<label class="chip"><input type="checkbox" data-c="'+c[0]+'">'+c[2]+'</label>'}).join("");

      function render(){
        var L=D.slice().sort(function(a,b){return a.kode.localeCompare(b.kode,"id",{numeric:true})});
        $("tb").innerHTML=L.length?L.map(function(r){
          return '<tr><td class="kd">'+esc(r.kode)+'</td><td class="nm">'+esc(r.nama)+'</td>'+
            C.map(function(c){return '<td class="c" data-l="'+c[1]+'">'+(r.c[c[0]]?OK:NO)+'</td>'}).join("")+
            '<td class="ket">'+esc(r.ket||"")+'</td><td class="ac">'+
            '<button type="button" class="ib" data-e="'+esc(r.kode)+'" title="Edit" aria-label="Edit">'+ED+'</button>'+
            (cf===r.kode?'<button type="button" class="ib cf" data-d="'+esc(r.kode)+'">Yakin?</button>':'<button type="button" class="ib rm" data-d="'+esc(r.kode)+'" title="Hapus" aria-label="Hapus">'+RM+'</button>')+
            '</td></tr>';
        }).join(""):'<tr class="er"><td colspan="9" class="empty" style="display:block;text-align:center">Belum ada data golongan.</td></tr>';
      }
      function reset(){
        editKode=null;$("kode").value="";$("nama").value="";$("ket").value="";
        document.querySelectorAll("[data-c]").forEach(function(c){c.checked=false});
        err("kode","");err("nama","");$("t1").textContent="Tambah Golongan BPJS";
      }
      $("rs").onclick=reset;
      $("kode").oninput=function(){err("kode","")};$("nama").oninput=function(){err("nama","")};
      $("sv").onclick=function(){
        var k=$("kode").value.trim(),n=$("nama").value.trim(),bad=0;
        if(!k){err("kode","Wajib diisi.");bad++}
        else if(D.some(function(r){return r.kode===k&&r.kode!==editKode})){err("kode","Kode sudah digunakan.");bad++}
        if(!n){err("nama","Wajib diisi.");bad++}
        if(bad){say("Periksa kolom yang ditandai.");$(!k||D.some(function(r){return r.kode===k&&r.kode!==editKode})?"kode":"nama").focus();return}
        var c={};document.querySelectorAll("[data-c]").forEach(function(x){if(x.checked)c[x.dataset.c]=1});
        var rec={kode:k,nama:n,c:c,ket:$("ket").value.trim()};
        if(editKode){D=D.map(function(r){return r.kode===editKode?rec:r});say("Golongan berhasil diperbarui.")}
        else{D.push(rec);say("Golongan berhasil disimpan.")}
        save();reset();render();
        document.dispatchEvent(new CustomEvent("golongan-save",{detail:rec}));
      };
      $("tb").addEventListener("click",function(e){
        var ed=e.target.closest("[data-e]"),d=e.target.closest("[data-d]");
        if(ed){var r=D.filter(function(x){return x.kode===ed.dataset.e})[0];editKode=r.kode;
          $("kode").value=r.kode;$("nama").value=r.nama;$("ket").value=r.ket||"";err("kode","");err("nama","");
          document.querySelectorAll("[data-c]").forEach(function(c){c.checked=!!r.c[c.dataset.c]});
          $("t1").textContent="Edit Golongan BPJS";scrollTo({top:0,behavior:"smooth"});$("nama").focus({preventScroll:true})}
        else if(d){var k=d.dataset.d;
          if(cf===k){var g=D.filter(function(x){return x.kode===k})[0];D=D.filter(function(x){return x.kode!==k});cf=null;clearTimeout(ct);if(editKode===k)reset();save();render();say("Golongan dihapus.");document.dispatchEvent(new CustomEvent("golongan-delete",{detail:g}))}
          else{cf=k;render();clearTimeout(ct);ct=setTimeout(function(){cf=null;render()},3000)}}
      });
      render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollGolonganBpjs);
} else {
    initPayrollGolonganBpjs();
}

document.addEventListener('livewire:navigated', initPayrollGolonganBpjs);
