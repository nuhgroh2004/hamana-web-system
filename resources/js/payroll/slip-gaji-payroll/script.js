const initPayrollSlipGajiRoots = new WeakSet();

function initPayrollSlipGaji() {
    const root = document.getElementById('payroll-slip-gaji');

    if (!root || initPayrollSlipGajiRoots.has(root)) {
        return;
    }

    initPayrollSlipGajiRoots.add(root);
    var $=function(i){return document.getElementById(i)};
      var MON=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      // Data contoh (ganti dengan data dari server). Kolom: nik, nama, jabatan, bulan, tahun, pokok, tetap, variabel, lainnya, manfaat, potongan
      var D=[
        ["1126.33.01.06","MUHAMMAD YUNUS AL FARIZI","Operator",11,2026,0,0,0,0,0,0],
        ["1126.32.01.05","IQBAL ROHMADON","Officer",11,2026,0,0,0,0,0,0],
        ["1126.31.01.06","RIFQI MISBAHHUDIN","Operator",11,2026,2485000,-1241818,112000,0,297842,407242],
        ["1126.30.01.06","MOCH. AL HUDA","Operator",11,2026,2485000,-1355455,140000,0,270617,370017],
        ["1126.31.01.06","RIFQI MISBAHHUDIN","Operator",10,2026,2485000,-1180000,98000,0,290000,395000],
        ["1126.30.01.06","MOCH. AL HUDA","Operator",10,2026,2485000,-1300000,125000,0,265000,360000]
      ].map(function(a,i){var r={id:i,nik:a[0],nama:a[1],jab:a[2],b:a[3],t:a[4],pokok:a[5],tetap:a[6],vari:a[7],lain:a[8],man:a[9],pot:a[10]};r.total=r.pokok+r.tetap+r.vari+r.lain+r.man-r.pot;r.bersih=r.total;return r});
      // Rumus (sesuai contoh): Total = Gaji Pokok + Tunjangan + Manfaat - Potongan; Gaji Bersih = Total
        function f(n){return Number(n).toLocaleString("en-US")}
      function esc(v){return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
      function say(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(t.t);t.t=setTimeout(function(){t.classList.remove("on")},2400)}
      var now=new Date();
      $("bl").innerHTML=MON.map(function(m,i){return '<option value="'+(i+1)+'"'+(i===now.getMonth()?' selected':'')+'>'+m+'</option>'}).join("");
      var ys="";for(var y=now.getFullYear()-3;y<=now.getFullYear()+1;y++)ys+='<option'+(y===now.getFullYear()?' selected':'')+'>'+y+'</option>';
      $("th").innerHTML=ys;

      var ICO={
        pr:'<svg class="i" viewBox="0 0 16 16"><path d="M4.5 6V2.5h7V6M4.5 11.5h-2V6h11v5.5h-2M4.5 9.5h7v4h-7z"/></svg>',
        fl:'<svg class="i" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3"/></svg>'};
      function list(){
        var q=$("q").value.trim().toLowerCase(),b=+$("bl").value,t=+$("th").value;
        return D.filter(function(r){return r.b===b&&r.t===t&&(!q||r.nama.toLowerCase().indexOf(q)>-1||r.nik.toLowerCase().indexOf(q)>-1)});
      }
      function render(){
        var L=list();
        $("tb").innerHTML=L.length?L.map(function(r,i){
          return '<tr><td class="no">'+(i+1)+'</td>'+
          '<td class="dt"><div class="nk">'+esc(r.nik)+'</div><div class="nm">'+esc(r.nama)+'</div><div class="jb">'+esc(r.jab)+'</div></td>'+
          '<td data-l="Bulan/Tahun">'+String(r.b).padStart(2,"0")+' / '+r.t+'</td>'+
          '<td class="n" data-l="Gaji Pokok">'+f(r.pokok)+'</td><td class="n" data-l="Tunjangan Gaji Tetap">'+f(r.tetap)+'</td><td class="n" data-l="Tunjangan Variabel">'+f(r.vari)+'</td><td class="n" data-l="Tunjangan Lainnya">'+f(r.lain)+'</td>'+
          '<td class="n" data-l="Manfaat">'+f(r.man)+'</td><td class="n" data-l="Potongan">'+f(r.pot)+'</td><td class="n" data-l="Total">'+f(r.total)+'</td>'+
          '<td class="n bs" data-l="Gaji Bersih">'+f(r.bersih)+'</td>'+
          '<td class="ac"><button type="button" class="ib" data-a="pr" data-id="'+r.id+'" title="Cetak slip" aria-label="Cetak slip">'+ICO.pr+'</button>'+
          '<button type="button" class="ib dl" data-a="dl" data-id="'+r.id+'" title="Unduh slip" aria-label="Unduh slip">'+ICO.fl+'</button>'+
          '</td></tr>';
        }).join(""):'<tr class="er"><td colspan="12" class="empty" style="display:block;text-align:center">Tidak ada data slip gaji untuk filter ini.</td></tr>';
        $("ft").textContent="Menampilkan "+L.length+" slip gaji — "+MON[+$("bl").value-1]+" "+$("th").value;
      }
      function slipHtml(r){
        function row(a,b,c){return '<tr'+(c?' class="t"':'')+'><td>'+a+'</td><td style="text-align:right">'+f(b)+'</td></tr>'}
        return '<h2>Slip Gaji</h2><div>'+MON[r.b-1]+' '+r.t+'</div><p><b>'+esc(r.nama)+'</b><br>'+esc(r.nik)+' · '+esc(r.jab)+'</p><table style="width:100%;border-collapse:collapse">'+
          row("Gaji Pokok",r.pokok)+row("Tunjangan Gaji Tetap",r.tetap)+row("Tunjangan Variabel",r.vari)+row("Tunjangan Lainnya",r.lain)+row("Manfaat",r.man)+row("Total",r.total,1)+row("Potongan",r.pot)+row("Gaji Bersih",r.bersih,1)+'</table>';
      }
      $("tb").addEventListener("click",function(e){
        var b=e.target.closest("[data-a]");if(!b)return;
        var id=+b.dataset.id,r=D.filter(function(x){return x.id===id})[0],a=b.dataset.a;
        if(a==="pr"){$("ps").innerHTML=slipHtml(r);document.dispatchEvent(new CustomEvent("slip-print",{detail:r}));window.print()}
        else if(a==="dl"){
          var h='<!DOCTYPE html><meta charset="utf-8"><title>Slip Gaji</title><body style="font:14px sans-serif;max-width:480px;margin:24px auto">'+slipHtml(r);
          var u=URL.createObjectURL(new Blob([h],{type:"text/html"})),l=document.createElement("a");
          l.href=u;l.download="slip-gaji-"+r.nik+"-"+r.b+"-"+r.t+".html";document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);
          document.dispatchEvent(new CustomEvent("slip-download",{detail:r}));say("Slip gaji "+r.nama+" diunduh.");
        }
      });
      $("q").oninput=$("bl").onchange=$("th").onchange=render;
      render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollSlipGaji);
} else {
    initPayrollSlipGaji();
}

document.addEventListener('livewire:navigated', initPayrollSlipGaji);
