const initPayrollPengaturanBpjsTkRoots = new WeakSet();

function initPayrollPengaturanBpjsTk() {
    const root = document.getElementById('payroll-pengaturan-bpjs-tk');

    if (!root || initPayrollPengaturanBpjsTkRoots.has(root)) {
        return;
    }

    initPayrollPengaturanBpjsTkRoots.add(root);
    var KEY="pengaturan-bpjs-tk-v1";
      var $=function(i){return document.getElementById(i)};
      var P=[["jkk","Jaminan Kecelakaan Kerja (JKK) %"],["jkm_c","JKM (Jaminan Kematian) C %"],["jht_c","JHT (Jaminan Hari Tua) C %"],["jht_e","JHT (Jaminan Hari Tua) E %"],["jp_c","JP (Jaminan Pensiun) C %"],["jp_e","JP (Jaminan Pensiun) E %"]];
      var MON=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      var V={};try{V=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}

      $("iuran").innerHTML=P.map(function(p){
        return '<div class="f" data-f="'+p[0]+'"><label for="'+p[0]+'">'+p[1]+'<i>*</i></label><div class="ig"><input class="fld" id="'+p[0]+'" inputmode="decimal" autocomplete="off"><span class="r">%</span></div><div class="er"></div></div>';
      }).join("");
      $("bulan").innerHTML='<option value="">--Pilih--</option>'+MON.map(function(m,i){return '<option value="'+(i+1)+'">'+m+'</option>'}).join("");
      var ys='<option value="">--Pilih--</option>';for(var y=2020;y<=2027;y++)ys+='<option>'+y+'</option>';
      $("tahun").innerHTML=ys;

      function digits(s){return String(s).replace(/\D/g,"")}
      function rupiah(s){var d=digits(s);return d?Number(d).toLocaleString("id-ID"):""}
      function say(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.t);t.t=setTimeout(function(){t.classList.remove("on")},2400)}
      function err(k,m){var f=document.querySelector('[data-f="'+k+'"]');f.classList.toggle("bad",!!m);f.querySelector(".er").textContent=m||""}

      // isi nilai tersimpan
      P.forEach(function(p){if(V[p[0]]!==undefined)$(p[0]).value=String(V[p[0]]).replace(".",",")});
      if(V.batas)$("batas").value=rupiah(V.batas);
      if(V.bulan)$("bulan").value=V.bulan;if(V.tahun)$("tahun").value=V.tahun;

      // input: persen hanya angka dan satu pemisah desimal; upah diformat ribuan
      P.forEach(function(p){$(p[0]).addEventListener("input",function(){
        var v=this.value.replace(/[^\d.,]/g,""),i=v.search(/[.,]/);
        if(i>-1)v=v.slice(0,i+1)+v.slice(i+1).replace(/[.,]/g,"");this.value=v;err(p[0],"")})});
      $("batas").addEventListener("input",function(){this.value=rupiah(this.value);err("batas","")});
      $("bulan").onchange=function(){err("bulan","")};$("tahun").onchange=function(){err("tahun","")};

      $("sv").onclick=function(){
        var out={},bad=0,first=null;
        function fail(k,m){err(k,m);bad++;if(!first)first=k}
        P.forEach(function(p){
          var raw=$(p[0]).value.trim().replace(",",".");
          if(raw===""||raw==="."){fail(p[0],"Wajib diisi.");return}
          var n=parseFloat(raw);
          if(isNaN(n)||n<0||n>100){fail(p[0],"Isi angka antara 0 dan 100.");return}
          err(p[0],"");out[p[0]]=n;
        });
        var b=digits($("batas").value);
        if(!b||+b<=0)fail("batas","Wajib diisi.");else{err("batas","");out.batas=+b}
        if(!$("bulan").value)fail("bulan","Pilih bulan mulai.");else{err("bulan","");out.bulan=$("bulan").value}
        if(!$("tahun").value)fail("tahun","Pilih tahun mulai.");else{err("tahun","");out.tahun=$("tahun").value}
        if(bad){say("Periksa kolom yang ditandai.");$(first).focus();return}
        try{localStorage.setItem(KEY,JSON.stringify(out))}catch(e){}
        document.dispatchEvent(new CustomEvent("bpjs-tk-save",{detail:out}));
        say("Pengaturan BPJS Tenaga Kerja berhasil disimpan.");
      };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollPengaturanBpjsTk);
} else {
    initPayrollPengaturanBpjsTk();
}

document.addEventListener('livewire:navigated', initPayrollPengaturanBpjsTk);
