const initPayrollMakanLemburRoots = new WeakSet();

function initPayrollMakanLembur() {
    const root = document.getElementById('payroll-makan-lembur');

    if (!root || initPayrollMakanLemburRoots.has(root)) {
        return;
    }

    initPayrollMakanLemburRoots.add(root);
    var KEY = "data-makan-lembur-v1";
      var $ = function(id) { return document.getElementById(id); };

      // Daftar master karyawan
      var EMP = [
        { nik: "1225.12.02.05", nama: "FADHILAH FATHUL JANAH", jab: "Officer" },
        { nik: "0723.12.02.05", nama: "KHARISMA QUINTYA BILQIS", jab: "Officer" },
        { nik: "0221.04.01.06", nama: "ANDI JAYA", jab: "Officer" },
        { nik: "0926.27.01.06", nama: "M. ALI AGUNG MULYANA ADI SAPUTRA", jab: "Driver" },
        { nik: "0221.03.01.06", nama: "M. KRISNA AJI PANGESTU", jab: "Officer" }
      ];

      var MON = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      // Data awal November 2026
      var SEED = [
        { id: "ml1", nik: "1225.12.02.05", nama: "FADHILAH FATHUL JANAH", jab: "Officer", bl: 11, th: 2026, jml: 2, input: "2026-11-19 08:56:29" },
        { id: "ml2", nik: "0723.12.02.05", nama: "KHARISMA QUINTYA BILQIS", jab: "Officer", bl: 11, th: 2026, jml: 2, input: "2026-11-19 08:56:29" },
        { id: "ml3", nik: "0221.04.01.06", nama: "ANDI JAYA", jab: "Officer", bl: 11, th: 2026, jml: 2, input: "2026-11-19 08:56:29" }
      ];

      var D = null;
      try { D = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (!D || !Array.isArray(D) || !D.length) D = SEED;

      var selEmpIdx = -1, editId = null, cf = null, ct = null;
      var DEF_BL = 11, DEF_TH = 2026; // Default November 2026 agar cocok dengan data awal

      function p2(n) { return String(n).padStart(2, "0"); }
      function stamp() {
        var d = new Date();
        return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " +
               p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
      }
      function esc(v) {
        return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      }
      function fmtNum(v) { return Number(v).toLocaleString("id-ID"); }
      function say(m) {
        var t = $("toast");
        t.textContent = m;
        t.classList.add("on");
        clearTimeout(t.t);
        t.t = setTimeout(function() { t.classList.remove("on"); }, 2600);
      }
      function save() {
        try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {}
      }
      function err(k, m) {
        var f = document.querySelector('[data-f="' + k + '"]');
        if (!f) return;
        f.classList.toggle("bad", !!m);
        var e = f.querySelector(".er");
        if (e) e.textContent = m || "";
      }

      // Isi opsi Bulan & Tahun
      var monOpts = MON.map(function(m, i) {
        return '<option value="' + (i + 1) + '">' + m + '</option>';
      }).join("");
      $("f-bl").innerHTML = monOpts;
      $("bl").innerHTML = monOpts;

      var ys = "";
      for (var y = 2023; y <= 2028; y++) {
        ys += '<option value="' + y + '">' + y + '</option>';
      }
      $("f-th").innerHTML = ys;
      $("th").innerHTML = ys;

      // Logika Custom Searchable Dropdown Karyawan
      function renderEmpList(term) {
        var q = (term || "").trim().toLowerCase();
        var filtered = EMP.map(function(e, i) { return { e: e, i: i }; }).filter(function(x) {
          return !q || x.e.nama.toLowerCase().indexOf(q) > -1 || x.e.nik.toLowerCase().indexOf(q) > -1;
        });
        $("cb-list").innerHTML = filtered.length ? filtered.map(function(x) {
          return '<div class="cb-opt' + (x.i === selEmpIdx ? ' sel' : '') + '" role="option" data-idx="' + x.i + '">' +
            '<b>' + esc(x.e.nama) + '</b>' +
            '<small>' + esc(x.e.nik) + ' &bull; ' + esc(x.e.jab) + '</small>' +
          '</div>';
        }).join("") : '<div class="cb-emp">Karyawan tidak ditemukan</div>';
      }

      function setEmp(idx) {
        selEmpIdx = idx;
        var valEl = $("cb-val");
        if (idx >= 0 && EMP[idx]) {
          valEl.textContent = EMP[idx].nik + " - " + EMP[idx].nama;
          valEl.classList.remove("ph");
          err("emp", "");
        } else {
          valEl.textContent = "--Pilih Karyawan--";
          valEl.classList.add("ph");
        }
        renderEmpList($("cb-s").value);
      }

      function toggleCb(force) {
        var cb = $("cb");
        var open = typeof force === "boolean" ? force : !cb.classList.contains("open");
        cb.classList.toggle("open", open);
        $("cb-btn").setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          $("cb-s").value = "";
          renderEmpList("");
          setTimeout(function() { $("cb-s").focus(); }, 10);
        }
      }

      $("cb-btn").onclick = function() { toggleCb(); };
      $("cb-s").oninput = function() { renderEmpList(this.value); };
      $("cb-s").onkeydown = function(e) {
        if (e.key === "Escape") { toggleCb(false); $("cb-btn").focus(); }
      };
      $("cb-list").addEventListener("click", function(e) {
        var opt = e.target.closest("[data-idx]");
        if (opt) {
          setEmp(+opt.dataset.idx);
          toggleCb(false);
        }
      });
      document.addEventListener("click", function(e) {
        if (!$("cb").contains(e.target)) toggleCb(false);
      });

      function defForm() {
        setEmp(-1);
        $("f-bl").value = DEF_BL;
        $("f-th").value = DEF_TH;
        $("f-jml").value = "";
        ["emp", "jml"].forEach(function(k) { err(k, ""); });
      }
      function defFilter() {
        $("q").value = "";
        $("bl").value = DEF_BL;
        $("th").value = DEF_TH;
      }
      defForm();
      defFilter();

      var ED = '<svg class="i" viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-8 8H2.5v-3z"/></svg>',
          RM = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';

      function list() {
        var q = $("q").value.trim().toLowerCase(),
            m = +$("bl").value,
            y = +$("th").value;
        return D.filter(function(r) {
          if (q && r.nama.toLowerCase().indexOf(q) < 0 && r.nik.toLowerCase().indexOf(q) < 0) return false;
          return +r.bl === m && +r.th === y;
        });
      }

      function render() {
        var L = list();
        $("tb").innerHTML = L.length ? L.map(function(r, i) {
          return '<tr>' +
            '<td class="no n">' + (i + 1) + '</td>' +
            '<td class="dt"><div class="nik">' + esc(r.nik) + '</div><div class="nm">' + esc(r.nama) + '</div><div class="jb">' + esc(r.jab) + '</div></td>' +
            '<td data-l="Periode" class="nw"><span class="tp">' + MON[r.bl - 1] + ' ' + r.th + '</span></td>' +
            '<td data-l="Jumlah" class="n">' + fmtNum(r.jml) + '</td>' +
            '<td data-l="Tgl. Input" class="nw n">' + esc(r.input) + '</td>' +
            '<td class="ac">' +
              '<button type="button" class="ib" data-e="' + r.id + '" title="Edit" aria-label="Edit">' + ED + '</button>' +
              (cf === r.id
                ? '<button type="button" class="ib cf" data-d="' + r.id + '">Yakin?</button>'
                : '<button type="button" class="ib rm" data-d="' + r.id + '" title="Hapus" aria-label="Hapus">' + RM + '</button>') +
            '</td>' +
          '</tr>';
        }).join("") : '<tr class="er"><td colspan="6" class="empty" style="display:block;text-align:center">Tidak ada data makan lembur pada periode ini.</td></tr>';
      }

      function valid() {
        var bad = 0;
        if (selEmpIdx < 0) { err("emp", "Pilih karyawan terlebih dahulu."); bad++; } else err("emp", "");
        var j = $("f-jml").value.trim();
        if (j === "" || isNaN(+j) || +j < 0) { err("jml", "Isi jumlah yang valid."); bad++; } else err("jml", "");
        if (bad) say("Lengkapi kolom bertanda *) dengan benar.");
        return !bad;
      }

      $("f-jml").oninput = function() { err("jml", ""); };

      function reset() {
        editId = null;
        defForm();
        $("t1").textContent = "Tambah makan lembur";
        $("sub").textContent = "Submit";
      }
      $("rs").onclick = reset;

      $("sub").onclick = function() {
        if (!valid()) return;
        var e = EMP[selEmpIdx],
            bl = +$("f-bl").value,
            th = +$("f-th").value,
            jml = +$("f-jml").value;

        var rec = {
          id: editId || Date.now().toString(36),
          nik: e.nik,
          nama: e.nama,
          jab: e.jab,
          bl: bl,
          th: th,
          jml: jml,
          input: stamp()
        };

        if (editId) D = D.filter(function(r) { return r.id !== editId; });
        // Menimpa data lama jika kombinasi karyawan + bulan + tahun sama
        D = D.filter(function(r) { return !(r.nik === rec.nik && +r.bl === rec.bl && +r.th === rec.th); });
        D.unshift(rec);
        save();

        document.dispatchEvent(new CustomEvent("makan-lembur-save", { detail: rec }));
        $("bl").value = bl;
        $("th").value = th;
        say(editId ? "Data makan lembur diperbarui." : "Data makan lembur disimpan.");
        reset();
        render();
      };

      $("tb").addEventListener("click", function(ev) {
        var ed = ev.target.closest("[data-e]"),
            d = ev.target.closest("[data-d]");
        if (ed) {
          var r = D.filter(function(x) { return x.id === ed.dataset.e; })[0];
          if (!r) return;
          editId = r.id;
          var idx = EMP.findIndex(function(e) { return e.nik === r.nik; });
          setEmp(idx);
          $("f-bl").value = r.bl;
          $("f-th").value = r.th;
          $("f-jml").value = r.jml;
          $("t1").textContent = "Edit makan lembur";
          $("sub").textContent = "Simpan Perubahan";
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (d) {
          var id = d.dataset.d;
          if (cf === id) {
            var g = D.filter(function(x) { return x.id === id; })[0];
            D = D.filter(function(x) { return x.id !== id; });
            cf = null;
            clearTimeout(ct);
            if (editId === id) reset();
            save();
            render();
            say("Data makan lembur dihapus.");
            document.dispatchEvent(new CustomEvent("makan-lembur-delete", { detail: g }));
          } else {
            cf = id;
            render();
            clearTimeout(ct);
            ct = setTimeout(function() { cf = null; render(); }, 3000);
          }
        }
      });

      // Live filter otomatis saat pencarian, bulan, atau tahun diubah
      ["q", "bl", "th"].forEach(function(k) {
        $(k).addEventListener("input", function() { cf = null; render(); });
      });

      $("tpl").onclick = function() {
        var csv = "\ufeffNIK,Nama Karyawan,Bulan,Tahun,Jumlah\n1225.12.02.05,FADHILAH FATHUL JANAH,11,2026,2\n";
        var u = URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
            a = document.createElement("a");
        a.href = u;
        a.download = "template-makan-lembur.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function() { URL.revokeObjectURL(u); }, 1000);
      };

      $("imp").onclick = function() {
        var f = $("file").files[0];
        if (!f) { say("Pilih file terlebih dahulu."); return; }
        document.dispatchEvent(new CustomEvent("makan-lembur-import", { detail: f }));
        say("Mengimpor " + f.name + "...");
      };

      render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollMakanLembur);
} else {
    initPayrollMakanLembur();
}

document.addEventListener('livewire:navigated', initPayrollMakanLembur);
