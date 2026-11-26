const initPayrollDataKehadiranRoots = new WeakSet();

function initPayrollDataKehadiran() {
    const root = document.getElementById('payroll-data-kehadiran');

    if (!root || initPayrollDataKehadiranRoots.has(root)) {
        return;
    }

    initPayrollDataKehadiranRoots.add(root);
    var KEY = "data-kehadiran-v1";
      var $ = function(id) { return document.getElementById(id); };

      // Daftar master karyawan (dapat diganti dengan data dari backend)
      var EMP = [
        { nik: "1225.12.02.05", nama: "FADHILAH FATHUL JANAH", jab: "Officer", defHadir: 22 },
        { nik: "0723.12.02.05", nama: "KHARISMA QUINTYA BILQIS", jab: "Officer", defHadir: 21 },
        { nik: "0221.04.01.06", nama: "ANDI JAYA", jab: "Officer", defHadir: 22 },
        { nik: "0926.27.01.06", nama: "M. ALI AGUNG MULYANA ADI SAPUTRA", jab: "Driver", defHadir: 24 },
        { nik: "0221.03.01.06", nama: "M. KRISNA AJI PANGESTU", jab: "Officer", defHadir: 20 }
      ];

      var MON = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      // Data awal (seed) untuk periode November 2026
      var SEED = [
        { id: "kh1", nik: "1225.12.02.05", nama: "FADHILAH FATHUL JANAH", jab: "Officer", bl: 11, th: 2026, jml: 22, input: "2026-11-26 08:30:15" },
        { id: "kh2", nik: "0723.12.02.05", nama: "KHARISMA QUINTYA BILQIS", jab: "Officer", bl: 11, th: 2026, jml: 21, input: "2026-11-26 08:30:15" },
        { id: "kh3", nik: "0221.04.01.06", nama: "ANDI JAYA", jab: "Officer", bl: 11, th: 2026, jml: 22, input: "2026-11-26 08:30:15" },
        { id: "kh4", nik: "0926.27.01.06", nama: "M. ALI AGUNG MULYANA ADI SAPUTRA", jab: "Driver", bl: 11, th: 2026, jml: 24, input: "2026-11-26 08:30:15" }
      ];

      var D = null;
      try { D = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (!D || !Array.isArray(D) || !D.length) D = SEED.slice();

      var now = new Date();
      var activeBl = now.getMonth() + 1;
      var activeTh = now.getFullYear();
      var editId = null;
      var confirmDelId = null;
      var confirmTimer = null;

      function p2(n) { return String(n).padStart(2, "0"); }
      function stamp() {
        var d = new Date();
        return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " +
               p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
      }
      function esc(v) {
        return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      }
      function save() {
        try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {}
      }
      function say(msg) {
        var t = $("toast");
        t.textContent = msg;
        t.classList.add("on");
        clearTimeout(t.t);
        t.t = setTimeout(function() { t.classList.remove("on"); }, 2600);
      }

      // Inisialisasi dropdown Bulan, Tahun, dan Karyawan
      $("p-bl").innerHTML = MON.map(function(m, i) {
        return '<option value="' + (i + 1) + '">' + m + '</option>';
      }).join("");

      var ys = "";
      for (var y = activeTh - 3; y <= activeTh + 1; y++) {
        ys += '<option value="' + y + '">' + y + '</option>';
      }
      $("p-th").innerHTML = ys;

      $("p-bl").value = activeBl;
      $("p-th").value = activeTh;

      $("m-emp").innerHTML = '<option value="">-- Pilih Karyawan --</option>' + EMP.map(function(e, i) {
        return '<option value="' + i + '">' + esc(e.nik) + ' - ' + esc(e.nama) + '</option>';
      }).join("");

      // Ikon SVG
      var IC_EDIT = '<svg class="i" viewBox="0 0 16 16"><path d="M10.5 2.5l3 3-8 8H2.5v-3z"/></svg>';
      var IC_DEL  = '<svg class="i" viewBox="0 0 16 16"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 7v4"/></svg>';
      var IC_OK   = '<svg class="i" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>';
      var IC_X    = '<svg class="i" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

      function filteredRows() {
        var q = $("q").value.trim().toLowerCase();
        return D.filter(function(r) {
          if (+r.bl !== +activeBl || +r.th !== +activeTh) return false;
          if (q && r.nama.toLowerCase().indexOf(q) < 0 && r.nik.toLowerCase().indexOf(q) < 0) return false;
          return true;
        });
      }

      function render() {
        var rows = filteredRows();
        $("lbl-per").textContent = MON[activeBl - 1] + " " + activeTh;
        $("lbl-cnt").textContent = rows.length + " data";

        if (!rows.length) {
          $("tb").innerHTML = '<tr class="er"><td colspan="6" class="empty" style="display:block;text-align:center">Tidak ada data kehadiran pada periode ' + MON[activeBl - 1] + ' ' + activeTh + '.</td></tr>';
          return;
        }

        $("tb").innerHTML = rows.map(function(r, idx) {
          var isEditing = editId === r.id;
          var isConfirming = confirmDelId === r.id;

          var jmlCell = isEditing
            ? '<input type="number" class="ed-inp n" id="ed-val-' + r.id + '" min="0" max="31" step="1" value="' + r.jml + '">'
            : '<span class="n" style="font-weight:600">' + r.jml + '</span> <span style="color:var(--mute);font-size:12px">hari</span>';

          var actCell = isEditing
            ? '<button type="button" class="ib ok" data-save="' + r.id + '" title="Simpan" aria-label="Simpan">' + IC_OK + '</button>' +
              '<button type="button" class="ib" data-cancel="1" title="Batal" aria-label="Batal">' + IC_X + '</button>'
            : '<button type="button" class="ib" data-edit="' + r.id + '" title="Edit Jumlah Kehadiran" aria-label="Edit">' + IC_EDIT + '</button>' +
              (isConfirming
                ? '<button type="button" class="ib cf" data-del="' + r.id + '">Yakin?</button>'
                : '<button type="button" class="ib rm" data-del="' + r.id + '" title="Hapus" aria-label="Hapus">' + IC_DEL + '</button>');

          return '<tr>' +
            '<td class="no n">' + (idx + 1) + '</td>' +
            '<td class="dt"><div class="nik">' + esc(r.nik) + '</div><div class="nm">' + esc(r.nama) + '</div><div class="jb">' + esc(r.jab) + '</div></td>' +
            '<td data-l="Periode" class="nw"><span class="tp">' + MON[r.bl - 1] + ' ' + r.th + '</span></td>' +
            '<td data-l="Jumlah Kehadiran">' + jmlCell + '</td>' +
            '<td data-l="Tgl. Input" class="nw n">' + esc(r.input) + '</td>' +
            '<td class="ac">' + actCell + '</td>' +
          '</tr>';
        }).join("");

        if (editId) {
          var inp = $("ed-val-" + editId);
          if (inp) { inp.focus(); inp.select(); }
        }
      }

      // Tombol Tampilkan Periode
      $("btn-show").onclick = function() {
        activeBl = +$("p-bl").value;
        activeTh = +$("p-th").value;
        editId = null;
        confirmDelId = null;
        render();
        say("Menampilkan data kehadiran " + MON[activeBl - 1] + " " + activeTh + ".");
      };

      // Tombol Ambil dari Absensi (Simulasi Sinkronisasi Database Absensi)
      $("btn-sync").onclick = function() {
        var bl = +$("p-bl").value;
        var th = +$("p-th").value;
        activeBl = bl;
        activeTh = th;
        editId = null;
        confirmDelId = null;

        var ts = stamp();
        var synced = [];
        EMP.forEach(function(emp, idx) {
          // Variasi kecil yang konsisten berdasarkan bulan & karyawan
          var hadir = Math.max(18, Math.min(26, emp.defHadir + ((bl + idx) % 3) - 1));
          var rec = {
            id: "sync-" + th + "-" + bl + "-" + idx,
            nik: emp.nik,
            nama: emp.nama,
            jab: emp.jab,
            bl: bl,
            th: th,
            jml: hadir,
            input: ts
          };
          D = D.filter(function(r) { return !(r.nik === emp.nik && +r.bl === bl && +r.th === th); });
          D.push(rec);
          synced.push(rec);
        });

        save();
        render();
        document.dispatchEvent(new CustomEvent("kehadiran-sync", {
          detail: { bl: bl, th: th, count: synced.length, data: synced }
        }));
        say("Berhasil mengambil " + synced.length + " data kehadiran dari absensi (" + MON[bl - 1] + " " + th + ").");
      };

      // Live Search di Card 3
      $("q").addEventListener("input", function() {
        confirmDelId = null;
        render();
      });

      // Toggle Panel Tambah Manual
      $("btn-toggle-add").onclick = function() {
        var box = $("add-box");
        box.hidden = !box.hidden;
        if (!box.hidden) {
          $("m-emp").value = "";
          $("m-jml").value = "";
          $("m-emp").focus();
        }
      };
      $("m-cancel").onclick = function() {
        $("add-box").hidden = true;
      };
      $("m-save").onclick = function() {
        var idxStr = $("m-emp").value;
        var jmlVal = $("m-jml").value.trim();
        if (idxStr === "") { say("Pilih karyawan terlebih dahulu."); return; }
        if (jmlVal === "" || isNaN(+jmlVal) || +jmlVal < 0) { say("Isi jumlah kehadiran yang valid."); return; }

        var emp = EMP[+idxStr];
        var rec = {
          id: Date.now().toString(36),
          nik: emp.nik,
          nama: emp.nama,
          jab: emp.jab,
          bl: activeBl,
          th: activeTh,
          jml: Math.round(+jmlVal),
          input: stamp()
        };

        // Timpa jika karyawan pada bulan & tahun yang sama sudah ada
        D = D.filter(function(r) { return !(r.nik === rec.nik && +r.bl === +rec.bl && +r.th === +rec.th); });
        D.unshift(rec);
        save();
        $("add-box").hidden = true;
        render();
        document.dispatchEvent(new CustomEvent("kehadiran-save", { detail: rec }));
        say("Data kehadiran " + emp.nama + " berhasil disimpan.");
      };

      // Aksi Inline Edit & Hapus pada Tabel
      $("tb").addEventListener("click", function(ev) {
        var btnEdit = ev.target.closest("[data-edit]");
        var btnSave = ev.target.closest("[data-save]");
        var btnCancel = ev.target.closest("[data-cancel]");
        var btnDel = ev.target.closest("[data-del]");

        if (btnEdit) {
          editId = btnEdit.dataset.edit;
          confirmDelId = null;
          render();
        } else if (btnSave) {
          var id = btnSave.dataset.save;
          var inp = $("ed-val-" + id);
          var val = inp ? inp.value.trim() : "";
          if (val === "" || isNaN(+val) || +val < 0) {
            say("Jumlah kehadiran tidak valid.");
            return;
          }
          var target = D.filter(function(x) { return x.id === id; })[0];
          if (target) {
            target.jml = Math.round(+val);
            target.input = stamp();
            save();
            document.dispatchEvent(new CustomEvent("kehadiran-save", { detail: target }));
            say("Jumlah kehadiran diperbarui.");
          }
          editId = null;
          render();
        } else if (btnCancel) {
          editId = null;
          render();
        } else if (btnDel) {
          var delId = btnDel.dataset.del;
          if (confirmDelId === delId) {
            var removed = D.filter(function(x) { return x.id === delId; })[0];
            D = D.filter(function(x) { return x.id !== delId; });
            confirmDelId = null;
            clearTimeout(confirmTimer);
            save();
            render();
            say("Data kehadiran dihapus.");
            document.dispatchEvent(new CustomEvent("kehadiran-delete", { detail: removed }));
          } else {
            confirmDelId = delId;
            editId = null;
            render();
            clearTimeout(confirmTimer);
            confirmTimer = setTimeout(function() { confirmDelId = null; render(); }, 3000);
          }
        }
      });

      // Simpan inline edit dengan tombol Enter / batal dengan Escape
      $("tb").addEventListener("keydown", function(ev) {
        if (!editId) return;
        if (ev.key === "Enter") {
          ev.preventDefault();
          var saveBtn = $("tb").querySelector('[data-save="' + editId + '"]');
          if (saveBtn) saveBtn.click();
        } else if (ev.key === "Escape") {
          editId = null;
          render();
        }
      });

      // Download Template CSV
      $("btn-tpl").onclick = function() {
        var csv = "\ufeffNIK,Nama Karyawan,Bulan,Tahun,Jumlah Kehadiran\n1225.12.02.05,FADHILAH FATHUL JANAH," + activeBl + "," + activeTh + ",22\n";
        var url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        var a = document.createElement("a");
        a.href = url;
        a.download = "template-kehadiran.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      };

      // Import File Excel / CSV
      $("btn-imp").onclick = function() {
        var file = $("file-imp").files[0];
        if (!file) {
          say("Pilih file terlebih dahulu.");
          return;
        }
        document.dispatchEvent(new CustomEvent("kehadiran-import", { detail: file }));
        say("Mengimpor file " + file.name + "...");
      };

      render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayrollDataKehadiran);
} else {
    initPayrollDataKehadiran();
}

document.addEventListener('livewire:navigated', initPayrollDataKehadiran);
