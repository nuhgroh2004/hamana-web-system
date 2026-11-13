<div id="saran">
    <div class="pg">
        <h1>Saran Anda</h1>
        <div class="note">
            <svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5.3 9.6c.7 1.1 1.6 1.7 2.7 1.7s2-.6 2.7-1.7M5.8 6.3v.01M10.2 6.3v.01"/></svg>
            <p>Jangan ragu untuk menyampaikan saran, kritik, maupun pendapat Anda. Setiap masukan sangat berarti untuk membantu kami menjadi lebih baik. Identitas Anda akan tetap terjaga kerahasiaannya, sehingga Anda dapat menyampaikan pendapat secara bebas dan nyaman tanpa perlu khawatir.</p>
        </div>

        <div class="fg">
            <label for="sr">Saran <span class="rq">*</span></label>
            <textarea class="fld" id="sr" maxlength="2000" placeholder="Tulis saran, kritik, atau pendapat Anda di sini"></textarea>
            <div class="cn" id="cn">0/2000</div>
            <p class="er" id="se" role="alert"></p>
        </div>

        <div class="fg">
            <label>Lampiran <span style="font-weight:400;color:var(--mute)">(opsional)</span></label>
            <p class="hint">PDF, JPG, atau PNG. Maksimal 5 file, masing-masing 5 MB.</p>
            <div class="dz" id="dz">
                <p>Tarik file ke sini, atau</p>
                <div class="row">
                    <button type="button" class="btn" id="pick"><svg class="i" viewBox="0 0 16 16"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v3h11v-3"/></svg>Pilih File</button>
                    <button type="button" class="btn" id="cam"><svg class="i" viewBox="0 0 16 16"><path d="M2 5.5h2.5L5.7 4h4.6l1.2 1.5H14v7H2z"/><circle cx="8" cy="8.8" r="2.2"/></svg>Ambil Foto</button>
                </div>
            </div>
            <div id="fl"></div>
            <input type="file" id="fin" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" multiple hidden>
            <input type="file" id="cin" accept="image/*" capture="environment" hidden>
        </div>

        <div class="acts"><span class="hint" style="margin:0" id="fc">0/5 file</span><button type="button" class="btn go" id="send">Kirim Saran</button></div>
    </div>
</div>
