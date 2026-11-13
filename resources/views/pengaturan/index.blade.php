<div class="set" id="set-page">
    <aside class="spn">
        <label class="srch">
            <x-master-komponen::icon name="search" />
            <input id="sq" type="text" placeholder="Cari pengaturan" autocomplete="off">
        </label>

        <div id="sl">
            @foreach ($panels as $item)
                <a class="si{{ $item['slug'] === $panel ? ' on' : '' }}"
                   href="{{ route('pengaturan.panel', $item['slug']) }}"
                   wire:navigate
                   data-name="{{ $item['name'] }}"
                   @if ($item['slug'] === $panel) aria-current="page" @endif>
                    <span class="ic">
                        <x-master-komponen::icon :name="$item['icon']" />
                    </span>
                    {{ $item['name'] }}
                </a>
            @endforeach
        </div>
    </aside>

    <section class="scn" id="scn">
        @include('pengaturan.'.$panel.'.index')
    </section>
</div>
