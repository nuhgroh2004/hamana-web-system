<?php

namespace App\Support;

use App\Models\User;

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
     * Get the sidebar menu groups the user is allowed to see.
     */
    public static function menuFor(?User $user): array
    {
        if (! $user) {
            return [];
        }

        $groups = [];

        foreach (static::menu() as $group) {
            $items = [];

            foreach ($group['items'] ?? [] as $item) {
                if (! empty($item['children'])) {
                    $children = array_values(array_filter(
                        $item['children'],
                        fn (array $child) => $user->canAccess($child['slug'] ?? null),
                    ));

                    if ($children === []) {
                        continue;
                    }

                    $item['children'] = $children;
                    $items[] = $item;

                    continue;
                }

                if ($user->canAccess($item['slug'] ?? null)) {
                    $items[] = $item;
                }
            }

            if ($items === []) {
                continue;
            }

            $group['items'] = $items;
            $groups[] = $group;
        }

        return $groups;
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
