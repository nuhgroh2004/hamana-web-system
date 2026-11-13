@props(['active' => null])

@php
    $groups = \App\Support\Modules::menuFor(auth()->user());
    $current = $active;

    if (! $current && request()->routeIs('pengaturan')) {
        $current = 'pengaturan';
    }

    if (! $current && request()->routeIs('module')) {
        $current = (string) request()->route('module');
    }

    $current = $current ?: 'dashboard';
@endphp

<nav id="nav" aria-label="Menu utama">
    <ul>
        @foreach ($groups as $group)
            @if (! empty($group['separator']))
                <li class="sep"></li>
            @endif

            @if (! empty($group['label']))
                <li class="grp">{{ $group['label'] }}</li>
            @endif

            @foreach ($group['items'] ?? [] as $item)
                @php
                    $hasChildren = ! empty($item['children']);
                    $href = $hasChildren
                        ? '#'
                        : (isset($item['route']) ? route($item['route']) : (isset($item['slug']) ? route('module', $item['slug']) : '#'));
                    $isActive = $current === ($item['slug'] ?? null);
                    $childActive = $hasChildren && collect($item['children'])->contains(
                        fn ($child) => $current === ($child['slug'] ?? null)
                    );
                @endphp

                <li class="t{{ $hasChildren ? ' has' : '' }}{{ $isActive ? ' act' : '' }}{{ $childActive ? ' has-act open' : '' }}">
                    <a href="{{ $href }}" @if ($href === '#') data-placeholder="true" @else wire:navigate @endif @if ($isActive) aria-current="page" @endif>
                        <x-master-komponen::icon :name="$item['icon']" />
                        {{ $item['label'] }}
                        @if ($hasChildren)
                            <x-master-komponen::icon name="down" class="ch" />
                        @endif
                    </a>

                    @if ($hasChildren)
                        <div class="sw">
                            <ul>
                                @foreach ($item['children'] as $child)
                                    @php
                                        $childIsActive = $current === ($child['slug'] ?? null);
                                    @endphp
                                    <li class="{{ $childIsActive ? 'act' : '' }}">
                                        <a href="{{ route('module', $child['slug']) }}" wire:navigate @if ($childIsActive) aria-current="page" @endif>
                                            {{ $child['label'] }}
                                        </a>
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    @endif
                </li>
            @endforeach
        @endforeach
    </ul>

    <ul class="lf">
        <li class="sep"></li>
        <li class="t">
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="lo">
                    <x-master-komponen::icon name="logout" />
                    Logout
                </button>
            </form>
        </li>
    </ul>
</nav>
