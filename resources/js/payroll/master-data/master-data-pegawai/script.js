const initPayrollMasterDataPegawaiRoots = new WeakSet();

function initPayrollMasterDataPegawai() {
    const root = document.getElementById('payroll-master-data-pegawai');

    if (!root || initPayrollMasterDataPegawaiRoots.has(root)) {
        return;
    }

    initPayrollMasterDataPegawaiRoots.add(root);
    var $=function(i){return document.getElementById(i)};
      // Jumlah ringkasan (ganti dengan data dari server)
      var STAT={aktif:85,nonaktif:77};
      // Data contoh (ganti dengan data dari server). Isian detail yang kosong tampil sebagai "–".
      var D=[
        {id:1,nama:"WIJATMOKO",email:"wijatmokose@gmail.com",nik:"0117.01.01.05",rek:"1390010487696",aktif:true,gaji:6182000,
         tlp:"085742140904",gol:"(4C-1)Junior Supervisor/Head",bpjs:"Golongan 3",no:"154",prof:0,pos:750000,ext:0,add:0,trans:14000,lunch:18000,perf:0,kop:0,ktp:"3328140409760001",npwp:"57.096.690.3-501.000",gpajak:"SGA",gnikah:"K/3",spajak:"",dept:""},
        {id:2,nama:"IMAM ZULFA KAMAL",email:"imamzulfakamal4@gmail.com",nik:"0122.01.01.06",rek:"1390024979316",aktif:true,gaji:2632000},
        {id:3,nama:"AZRUL MUZAKIR",email:"azrulmuzakir484@gmail.com",nik:"0126.01.01.06",rek:"1390030270767",aktif:true,gaji:2485000},
        {id:4,nama:"EKO MURIYANTO",email:"ekomuriyanto4@gmail.com",nik:"0126.02.01.06",rek:"1390030281152",aktif:true,gaji:2485000}
      ];
      var st={f:"aktif",k:"nik",d:1,open:{}};
      var COLS=[["nama","Pegawai"],["nik","NIK"],["rek","No. Rekening"],["aktif","Status"],["gaji","Gaji Pokok"]];
      function rp(n){return "Rp "+Number(n).toLocaleString("id-ID")}
      function esc(v){return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
      function say(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.t);t.t=setTimeout(function(){t.classList.remove("on")},2400)}
      function ini(n){return n.split(/\s+/).slice(0,2).map(function(w){return w[0]}).join("")}
      $("sa").textContent=STAT.aktif;$("sn").textContent=STAT.nonaktif;
      $("sr").innerHTML=COLS.map(function(c){return '<option value="'+c[0]+':1">'+c[1]+' ↑</option><option value="'+c[0]+':-1">'+c[1]+' ↓</option>'}).join("");

      function cell(l,v,money){var z=v===undefined||v===null||v==="";var zero=money&&!z&&+v===0;
        return '<div class="c"><span>'+l+'</span><b'+(z||zero?' class="z"':'')+'>'+(z?"–":esc(money?rp(v):v))+'</b></div>'}
      function detail(r){
        return '<div class="gd">'+cell("No. Telp",r.tlp)+cell("Gol/Jabatan",r.gol)+cell("Gol. BPJS",r.bpjs)+cell("No.",r.no)+
          cell("Gaji Pokok",r.gaji,1)+cell("Profesional/Keahlian",r.prof,1)+cell("Position/Jabatan",r.pos,1)+cell("External PR Allowance",r.ext,1)+
          cell("Add Job",r.add,1)+cell("Transport/Day",r.trans,1)+cell("Lunch/Day",r.lunch,1)+cell("Performance",r.perf,1)+
          cell("Simpanan Koperasi",r.kop,1)+cell("No. KTP",r.ktp)+cell("NPWP",r.npwp)+cell("Code Grup Pajak",r.gpajak)+
          cell("Code Grup Status Pernikahan",r.gnikah)+cell("Code Status Pajak",r.spajak)+cell("Departemen",r.dept)+'</div>';
      }
      function list(){
        var q=$("q").value.trim().toLowerCase();
        return D.filter(function(r){
          if(st.f==="aktif"&&!r.aktif)return false;if(st.f==="off"&&r.aktif)return false;
          return !q||[r.nama,r.nik,r.email,r.rek,r.tlp||""].join(" ").toLowerCase().indexOf(q)>-1;
        }).sort(function(a,b){var x=a[st.k],y=b[st.k];
          if(typeof x==="string")return x.localeCompare(y,"id",{numeric:true})*st.d;return (x>y?1:x<y?-1:0)*st.d});
      }
      function render(){
        var L=list();
        $("tb").innerHTML=L.length?L.map(function(r){
          var o=!!st.open[r.id];
          return '<tr class="m" data-t="'+r.id+'" tabindex="0" role="button" aria-expanded="'+o+'"><td class="pc"><div class="pw"><span class="tg"><svg class="i" viewBox="0 0 16 16" style="width:12px;height:12px"><path d="M6 3.5l5 4.5-5 4.5"/></svg></span>'+
            '<div class="av">'+esc(ini(r.nama))+'</div><div><div class="nm">'+esc(r.nama)+'</div><div class="em">'+esc(r.email)+'</div></div></div></td>'+
            '<td data-l="NIK">'+esc(r.nik)+'</td><td data-l="No. Rekening">'+esc(r.rek)+'</td>'+
            '<td data-l="Status"><span class="bg'+(r.aktif?'':' off')+'">'+(r.aktif?'Aktif':'Tidak aktif')+'</span></td>'+
            '<td class="r gj" data-l="Gaji Pokok">'+rp(r.gaji)+'</td>'+
            '<td class="ac"><button type="button" class="btn sm" data-e="'+r.id+'">Edit</button></td></tr>'+
            (o?'<tr class="d"><td colspan="6">'+detail(r)+'</td></tr>':'');
        }).join(""):'<tr class="d"><td colspan="6" class="empty">Tidak ada data pegawai.</td></tr>';
        document.querySelectorAll("th.s").forEach(function(h){var on=h.dataset.k===st.k;h.classList.toggle("on",on);h.querySelector(".so").textContent=on&&st.d<0?"▼":"▲"});
        $("sr").value=st.k+":"+st.d;
        document.querySelectorAll("#sg button").forEach(function(b){b.classList.toggle("on",b.dataset.f===st.f)});
      }
      $("tb").addEventListener("click",function(e){
        var ed=e.target.closest("[data-e]"),t=e.target.closest("tr.m");
        if(ed){var r=D.filter(function(x){return x.id===+ed.dataset.e})[0];document.dispatchEvent(new CustomEvent("pegawai-edit",{detail:r}));say("Edit data "+r.nama)}
        else if(t)toggle(t.dataset.t);
      });
      $("tb").addEventListener("keydown",function(e){
        var t=e.target.closest("tr.m");if(!t||e.target!==t||(e.key!=="Enter"&&e.key!==" "))return;
        e.preventDefault();toggle(t.dataset.t);
      });
      function toggle(id){if(st.open[id])delete st.open[id];else st.open[id]=true;render();var n=document.querySelector('tr.m[data-t="'+id+'"]');if(n)n.focus({preventScroll:true})}
      document.querySelector("thead").addEventListener("click",function(e){
        var h=e.target.closest("th.s");if(!h)return;
        if(st.k===h.dataset.k)st.d=-st.d;else{st.k=h.dataset.k;st.d=1}render();
      });
      $("sr").onchange=function(){var p=this.value.split(":");st.k=p[0];st.d=+p[1];render()};
      $("sg").addEventListener("click",function(e){var b=e.target.closest("[data-f]");if(b){st.f=b.dataset.f;render()}});
      $("q").oninput=render;
      $("ex").onclick=function(){document.dispatchEvent(new CustomEvent("pegawai-export"));say("Menyiapkan export data...")};
      $("im").onclick=function(){document.dispatchEvent(new CustomEvent("pegawai-import"))};
      $("sy").onclick=function(){document.dispatchEvent(new CustomEvent("pegawai-sync"));say("Sinkronisasi data dimulai...")};
      render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollMasterDataPegawai);
} else {
    initPayrollMasterDataPegawai();
}

document.addEventListener('livewire:navigated', initPayrollMasterDataPegawai);
