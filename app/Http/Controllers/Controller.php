<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Returns the previous URL based on the Referer header, or null when:
     * - there is no Referer (direct URL entry),
     * - the Referer path matches the current request path (full-page refresh).
     *
     * The Referer is reliable because Inertia client-side navigations always include the
     * page the user came from, while a refresh sends the current page (or nothing).
     */
    protected function resolveBackUrl(Request $request): ?string
    {
        $referrer = $request->header('Referer');

        if (! $referrer) {
            return null;
        }

        $referrerPath = $this->normalizedPathFromUrl($referrer);
        $currentPath = $this->normalizedPathFromUrl($request->fullUrl());

        if ($referrerPath === $currentPath) {
            return null;
        }

        return url($referrer);
    }

    private function normalizedPathFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);

        if (! is_string($path) || $path === '') {
            return '/';
        }

        $path = '/'.trim($path, '/');

        if ($path === '//') {
            return '/';
        }

        return $path;
    }
}
