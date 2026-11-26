const initPayrollDataHariLiburRoots = new WeakSet();

function initPayrollDataHariLibur() {
    const root = document.getElementById('payroll-data-hari-libur');

    if (!root || initPayrollDataHariLiburRoots.has(root)) {
        return;
    }

    initPayrollDataHariLiburRoots.add(root);
    var KEY="data-hari-libur-v1";
      var API_URL=function(y){return "https://api-harilibur.vercel.app/api?year="+y}; // ganti dengan endpoint Anda
      var $=function(i){return document.getElementById(i)};
      var SEED=[
        {id:"s1",judul:"Tahun Baru 2027 Masehi",tgl:"2027-01-01"},
        {id:"s2",judul:"Isra Mi’raj Nabi Muhammad SAW",tgl:"2027-01-05"},
        {id:"s3",judul:"Tahun Baru Imlek 2578 Kongzili",tgl:"2027-02-06"},
        {id:"s4",judul:"Hari Suci Nyepi Tahun Baru Saka 1949",tgl:"2027-03-09"}
      ];
      var D=null;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){}
      if(!D)D=SEED;
      var editId=null,cf=null,ct=null,now=new Date(),sel={};
      function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
      function esc(v){return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
      function fmt(s){var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
      function say(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.t);t.t=setTimeout(function(){t.classList.remove("on")},2600)}
      function years(sel){
        var set={};for(var y=now.getFullYear()-1;y<=now.getFullYear()+2;y++)set[y]=1;
        D.forEach(function(r){set[r.tgl.slice(0,4)]=1});set[sel]=1;
        var o=Object.keys(set).sort().map(function(y){return '<option'+(y==sel?' selected':'')+'>'+y+'</option>'}).join("");
        $("th3").innerHTML=o;
        var cur=$("th").value||"2027";$("th").innerHTML=o;$("th").value=set[cur]?cur:sel;
      }
      years("2027");

      var ICO={ed:'<svg class="i" viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-8 8H2.5v-3z"/></svg>',
        rm:'<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>'};
      function list(){
        var y=$("th3").value,q=$("q").value.trim().toLowerCase();
        return D.filter(function(r){return r.tgl.slice(0,4)===y&&(!q||r.judul.toLowerCase().indexOf(q)>-1||fmt(r.tgl).indexOf(q)>-1)})
          .sort(function(a,b){return a.tgl<b.tgl?-1:a.tgl>b.tgl?1:0});
      }
      function render(){
        var L=list();
        var ns=L.filter(function(r){return sel[r.id]}).length;
        [$("ca"),$("ca2")].forEach(function(c){c.checked=L.length>0&&ns===L.length;c.indeterminate=ns>0&&ns<L.length});
        $("sc").textContent=ns?ns+" dipilih":"";
        $("t3").textContent="Data Hari Libur Tahun "+$("th3").value;
        $("tb").innerHTML=L.length?L.map(function(r,i){
          return '<tr'+(sel[r.id]?' class="sel"':'')+'><td class="ck"><input type="checkbox" data-c="'+r.id+'"'+(sel[r.id]?' checked':'')+' aria-label="Pilih '+esc(r.judul)+'"></td><td class="jd">'+esc(r.judul)+'</td><td class="tg">'+fmt(r.tgl)+'</td><td class="ac">'+
            '<button type="button" class="ib" data-e="'+r.id+'" title="Edit" aria-label="Edit">'+ICO.ed+'</button>'+
            (cf===r.id?'<button type="button" class="ib cf" data-d="'+r.id+'">Yakin?'+(sel[r.id]&&nsel()>1?' ('+nsel()+')':'')+'</button>':'<button type="button" class="ib rm" data-d="'+r.id+'" title="Hapus" aria-label="Hapus">'+ICO.rm+'</button>')+
            '</td></tr>';
        }).join(""):'<tr class="er"><td colspan="4" class="empty" style="display:block;text-align:center">Tidak ada data hari libur.</td></tr>';
      }
      function nsel(){return Object.keys(sel).length}
      function reset(){editId=null;$("ket").value="";$("tgl").value="";$("t1").textContent="Input Hari Libur";$("st").textContent="Simpan"}

      $("sv").onclick=function(){
        var k=$("ket").value.trim(),t=$("tgl").value;
        if(!k||!t){say("Keterangan dan tanggal wajib diisi.");return}
        var r;
        if(editId){r=D.filter(function(x){return x.id===editId})[0];r.judul=k;r.tgl=t;say("Hari libur berhasil diperbarui.")}
        else{r={id:Date.now().toString(36),judul:k,tgl:t};D.push(r);say("Hari libur berhasil disimpan.")}
        save();years(t.slice(0,4));reset();render();
        document.dispatchEvent(new CustomEvent("libur-save",{detail:r}));
      };
      $("ap").onclick=function(){
        var y=$("th").value,b=$("ap");b.disabled=true;$("at").textContent="Mengambil...";
        fetch(API_URL(y)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(a){
          var n=0,have={};D.forEach(function(r){have[r.tgl]=1});
          (Array.isArray(a)?a:[]).forEach(function(x){
            var d=(x.holiday_date||x.tanggal||x.date||"").split("-");if(d.length!==3)return;
            var t=d[0]+"-"+("0"+d[1]).slice(-2)+"-"+("0"+d[2]).slice(-2),j=x.holiday_name||x.keterangan||x.name||"";
            if(!j||t.slice(0,4)!==y||have[t])return;have[t]=1;D.push({id:"a"+t,judul:j,tgl:t});n++;
          });
          save();years(y);sel={};render();say(n?n+" hari libur tahun "+y+" berhasil disimpan.":"Tidak ada data baru untuk tahun "+y+".");
          document.dispatchEvent(new CustomEvent("libur-api",{detail:{tahun:y,jumlah:n}}));
        }).catch(function(){say("Gagal mengambil data dari API.")}).then(function(){b.disabled=false;$("at").textContent="Simpan"});
      };
      $("th3").onchange=function(){cf=null;sel={};render()};
      function all(e){var L=list();if(e.target.checked)L.forEach(function(r){sel[r.id]=1});else L.forEach(function(r){delete sel[r.id]});cf=null;render()}
      $("ca").onchange=$("ca2").onchange=all;
      $("tb").addEventListener("change",function(e){var c=e.target.closest("[data-c]");if(!c)return;if(c.checked)sel[c.dataset.c]=1;else delete sel[c.dataset.c];cf=null;render()});
      $("q").oninput=render;
      $("tb").addEventListener("click",function(e){
        var ed=e.target.closest("[data-e]"),d=e.target.closest("[data-d]");
        if(ed){var r=D.filter(function(x){return x.id===ed.dataset.e})[0];editId=r.id;$("ket").value=r.judul;$("tgl").value=r.tgl;
          $("t1").textContent="Edit Hari Libur";$("st").textContent="Simpan Perubahan";scrollTo({top:0,behavior:"smooth"});$("ket").focus({preventScroll:true})}
        else if(d){var id=d.dataset.d;
          if(cf===id){var ids=sel[id]?Object.keys(sel):[id],gone=D.filter(function(x){return ids.indexOf(x.id)>-1});D=D.filter(function(x){return ids.indexOf(x.id)<0});cf=null;sel={};clearTimeout(ct);if(ids.indexOf(editId)>-1)reset();save();render();say(gone.length>1?gone.length+" hari libur dihapus.":"Hari libur dihapus.");document.dispatchEvent(new CustomEvent("libur-delete",{detail:gone}))}
          else{cf=id;render();clearTimeout(ct);ct=setTimeout(function(){cf=null;render()},3000)}}
      });
      render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollDataHariLibur);
} else {
    initPayrollDataHariLibur();
}

document.addEventListener('livewire:navigated', initPayrollDataHariLibur);
