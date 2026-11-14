<div id="permohonan-saya">
    <div class="pg">
        <h1>Permohonan Saya</h1>
        <p class="ds">Status dan riwayat permohonan</p>

        <div class="tabs" role="tablist" aria-label="Status permohonan">
            <button type="button" role="tab" id="t-draft" data-tab="draft" aria-selected="true" aria-controls="p-draft">
                <svg class="i" viewBox="0 0 16 16"><path d="M9 2.5H3.5v10h10V7M11 2.5L13.5 5 8 10.5H5.5V8z"/></svg>
                Draft <span class="cnt" id="c-draft">0</span>
            </button>
            <button type="button" role="tab" id="t-menunggu" data-tab="menunggu" aria-selected="false" aria-controls="p-menunggu" tabindex="-1">
                <svg class="i" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>
                Menunggu <span class="cnt" id="c-menunggu">0</span>
            </button>
            <button type="button" role="tab" id="t-riwayat" data-tab="riwayat" aria-selected="false" aria-controls="p-riwayat" tabindex="-1">
                <svg class="i" viewBox="0 0 16 16"><path d="M2.5 8a5.5 5.5 0 105.5-5.5A5.5 5.5 0 004 4.2M2.5 2.5v2.2h2.2M8 5v3l2 1.2"/></svg>
                Riwayat <span class="cnt" id="c-riwayat">0</span>
            </button>
        </div>

        <div id="p-draft" role="tabpanel" aria-labelledby="t-draft"></div>
        <div id="p-menunggu" role="tabpanel" aria-labelledby="t-menunggu" hidden></div>
        <div id="p-riwayat" role="tabpanel" aria-labelledby="t-riwayat" hidden></div>
    </div>

    <input type="file" id="fin" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" multiple hidden>
    <input type="file" id="cin" accept="image/*" capture="environment" hidden>
</div>
