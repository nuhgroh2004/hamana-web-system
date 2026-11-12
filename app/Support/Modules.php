<?php

namespace App\Support;

class Modules
{
    /**
     * Get the sidebar menu groups.
     */
    public static function menu(): array
    {
        return config('modules.groups', []);
    }

    /**
     * Flatten every module that has a slug into a keyed array.
     */
    public static function all(): array
    {
        $modules = [];

        foreach (static::menu() as $group) {
            foreach ($group['items'] ?? [] as $item) {
                static::collect($item, $modules);
            }
        }

        return $modules;
    }

    /**
     * Find a module by its slug.
     */
    public static function find(string $slug): ?array
    {
        return static::all()[$slug] ?? null;
    }

    /**
     * Recursively collect module items that have a slug.
     */
    protected static function collect(array $item, array &$modules): void
    {
        if (! empty($item['slug'])) {
            $modules[$item['slug']] = $item;
        }

        foreach ($item['children'] ?? [] as $child) {
            static::collect($child, $modules);
        }
    }
}
