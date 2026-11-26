const initPayrollDataRapelRoots = new WeakSet();

function initPayrollDataRapel() {
    const root = document.getElementById('payroll-data-rapel');

    if (!root || initPayrollDataRapelRoots.has(root)) {
        return;
    }

    initPayrollDataRapelRoots.add(root);
    var KEY = "data-rapel-v1";
      var $ = function(id) { return document.getElementById(id); };

      // Daftar master karyawan (ganti dengan data dari server)
      var EMP = [
        { nik: "0220.05.01.06", nama: "M. ALMI HANIF", jab: "Leader" },
        { nik: "0821.15.01.06", nama: "DIVALIN HERLAMBANG", jab: "Operator" },
        { nik: "0126.01.01.06", nama: "AZRUL MUZAKIR", jab: "Operator" },
        { nik: "0126.02.01.06", nama: "EKO MURIYANTO", jab: "Operator" },
        { nik: "0626.09.01.06", nama: "MUHAMMAD SYARIFUL ISLAM", jab: "Operator" },
        { nik: "0926.23.01.06", nama: "AS. HURI", jab: "Operator" }
      ];

      var MON = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      // Data awal November 2026
      var SEED = [
        { id: "rp1", nik: "0220.05.01.06", nama: "M. ALMI HANIF", jab: "Leader", bl: 11, th: 2026, tot: 311306, input: "2026-11-20 14:21:15" },
        { id: "rp2", nik: "0821.15.01.06", nama: "DIVALIN HERLAMBANG", jab: "Operator", bl: 11, th: 2026, tot: 243422, input: "2026-11-20 14:21:15" },
        { id: "rp3", nik: "0126.01.01.06", nama: "AZRUL MUZAKIR", jab: "Operator", bl: 11, th: 2026, tot: 229827, input: "2026-11-20 14:21:15" },
        { id: "rp4", nik: "0126.02.01.06", nama: "EKO MURIYANTO", jab: "Operator", bl: 11, th: 2026, tot: 229827, input: "2026-11-20 14:21:15" },
        { id: "rp5", nik: "0626.09.01.06", nama: "MUHAMMAD SYARIFUL ISLAM", jab: "Operator", bl: 11, th: 2026, tot: 229827, input: "2026-11-20 14:21:15" },
        { id: "rp6", nik: "0926.23.01.06", nama: "AS. HURI", jab: "Operator", bl: 11, th: 2026, tot: 229827, input: "2026-11-20 14:21:15" }
      ];

      var D = null;
      try { D = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (!D || !Array.isArray(D) || !D.length) D = SEED.slice();

      var selEmpIdx = -1, editId = null, cf = null, ct = null;
      var now = new Date();
      var DEF_BL = now.getMonth() + 1;
      var DEF_TH = now.getFullYear();

      function p2(n) { return String(n).padStart(2, "0"); }
      function stamp() {
        var d = new Date();
        return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " +
               p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
      }
      function esc(v) {
        return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      }
      function fmtRp(v) {
        var num = Number(v) || 0;
        return num.toLocaleString("id-ID");
      }
      function parseRp(str) {
        var clean = String(str || "").replace(/[^\d]/g, "");
        return clean === "" ? NaN : parseInt(clean, 10);
      }
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
      for (var y = DEF_TH - 3; y <= DEF_TH + 1; y++) {
        ys += '<option value="' + y + '">' + y + '</option>';
      }
      $("f-th").innerHTML = ys;
      $("th").innerHTML = ys;

      // Format pemisah ribuan otomatis pada input Total (Rp)
      $("f-tot").addEventListener("input", function() {
        err("tot", "");
        var raw = this.value.replace(/[^\d]/g, "");
        this.value = raw === "" ? "" : parseInt(raw, 10).toLocaleString("id-ID");
      });

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
        $("f-tot").value = "";
        ["emp", "tot"].forEach(function(k) { err(k, ""); });
      }
      function defFilter() {
        $("q").value = "";
        $("bl").value = DEF_BL;
        $("th").value = DEF_TH;
      }
      defForm();
      defFilter();

      // Ikon Edit & Ikon Tong Sampah (Trash Can)
      var ED = '<svg class="i" viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-8 8H2.5v-3z"/></svg>';
      var RM = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';

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
            '<td data-l="Total (Rp)" class="n">' + fmtRp(r.tot) + '</td>' +
            '<td data-l="Tgl. Input" class="nw n">' + esc(r.input) + '</td>' +
            '<td class="ac">' +
              '<button type="button" class="ib" data-e="' + r.id + '" title="Edit" aria-label="Edit">' + ED + '</button>' +
              (cf === r.id
                ? '<button type="button" class="ib cf" data-d="' + r.id + '">Yakin?</button>'
                : '<button type="button" class="ib rm" data-d="' + r.id + '" title="Hapus" aria-label="Hapus">' + RM + '</button>') +
            '</td>' +
          '</tr>';
        }).join("") : '<tr class="er"><td colspan="6" class="empty" style="display:block;text-align:center">Tidak ada data rapel pada periode ini.</td></tr>';
      }

      function valid() {
        var bad = 0;
        if (selEmpIdx < 0) { err("emp", "Pilih karyawan terlebih dahulu."); bad++; } else err("emp", "");
        var totVal = parseRp($("f-tot").value);
        if (isNaN(totVal) || totVal < 0) { err("tot", "Isi total rapel yang valid."); bad++; } else err("tot", "");
        if (bad) say("Lengkapi kolom bertanda *) dengan benar.");
        return !bad;
      }

      function reset() {
        editId = null;
        defForm();
        $("t1").textContent = "Tambah rapel";
        $("sub").textContent = "Submit";
      }
      $("rs").onclick = reset;

      $("sub").onclick = function() {
        if (!valid()) return;
        var e = EMP[selEmpIdx],
            bl = +$("f-bl").value,
            th = +$("f-th").value,
            tot = parseRp($("f-tot").value);

        var rec = {
          id: editId || Date.now().toString(36),
          nik: e.nik,
          nama: e.nama,
          jab: e.jab,
          bl: bl,
          th: th,
          tot: tot,
          input: stamp()
        };

        if (editId) D = D.filter(function(r) { return r.id !== editId; });
        // Menimpa data lama jika kombinasi karyawan + bulan + tahun sama
        D = D.filter(function(r) { return !(r.nik === rec.nik && +r.bl === rec.bl && +r.th === rec.th); });
        D.unshift(rec);
        save();

        document.dispatchEvent(new CustomEvent("rapel-save", { detail: rec }));
        $("bl").value = bl;
        $("th").value = th;
        say(editId ? "Data rapel diperbarui." : "Data rapel disimpan.");
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
          $("f-tot").value = fmtRp(r.tot);
          $("t1").textContent = "Edit rapel";
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
            say("Data rapel dihapus.");
            document.dispatchEvent(new CustomEvent("rapel-delete", { detail: g }));
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
        var csv = "\ufeffNIK,Nama Karyawan,Bulan,Tahun,Total (Rp)\n0220.05.01.06,M. ALMI HANIF,11,2026,311306\n";
        var u = URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
            a = document.createElement("a");
        a.href = u;
        a.download = "template-rapel.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function() { URL.revokeObjectURL(u); }, 1000);
      };

      $("imp").onclick = function() {
        var f = $("file").files[0];
        if (!f) { say("Pilih file terlebih dahulu."); return; }
        document.dispatchEvent(new CustomEvent("rapel-import", { detail: f }));
        say("Mengimpor " + f.name + "...");
      };

      render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollDataRapel);
} else {
    initPayrollDataRapel();
}

document.addEventListener('livewire:navigated', initPayrollDataRapel);
