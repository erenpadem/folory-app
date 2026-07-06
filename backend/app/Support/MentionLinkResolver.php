<?php

namespace App\Support;

use App\Models\Book;
use App\Models\Page;
use App\Models\Section;
use App\Models\User;

final class MentionLinkResolver
{
    /**
     * @return array<string, string> keys like "author:7", "page:12"
     */
    public static function buildLinkMap(string $content, ?int $contextBookId = null): array
    {
        $links = [];
        if ($content === '') {
            return $links;
        }

        if (! preg_match_all('/@(book|section|page|author)\{(\d+)\}/', $content, $matches, PREG_SET_ORDER)) {
            return $links;
        }

        foreach ($matches as $match) {
            $type = $match[1];
            $id = (int) $match[2];
            $key = "{$type}:{$id}";

            if (isset($links[$key])) {
                continue;
            }

            $href = self::resolveHref($type, $id, $contextBookId);
            if ($href !== null) {
                $links[$key] = $href;
            }
        }

        return $links;
    }

    private static function resolveHref(string $type, int $id, ?int $contextBookId): ?string
    {
        return match ($type) {
            'author' => self::authorHref($id),
            'book' => self::bookHref($id),
            'section' => self::sectionHref($id),
            'page' => self::pageHref($id),
            default => null,
        };
    }

    private static function authorHref(int $userId): ?string
    {
        $user = User::query()->find($userId);
        if (! $user) {
            return null;
        }

        if ($user->username) {
            return '/profile/'.rawurlencode($user->username);
        }

        return '/profile/'.$user->id;
    }

    private static function bookHref(int $bookId): ?string
    {
        $book = Book::query()->find($bookId);
        if (! $book) {
            return null;
        }

        return '/book/'.rawurlencode($book->slug ?: (string) $book->id);
    }

    private static function sectionHref(int $sectionId): ?string
    {
        $section = Section::query()->with('book:id,slug')->find($sectionId);
        if (! $section || ! $section->book) {
            return null;
        }

        $bookPath = rawurlencode($section->book->slug ?: (string) $section->book_id);
        $firstPage = Page::query()
            ->where('section_id', $section->id)
            ->orderBy('order')
            ->orderBy('id')
            ->first();

        if ($firstPage) {
            return "/book/{$bookPath}/read/{$section->id}/{$firstPage->id}";
        }

        return "/book/{$bookPath}";
    }

    private static function pageHref(int $pageId): ?string
    {
        $page = Page::query()
            ->with(['section.book:id,slug'])
            ->find($pageId);

        if (! $page || ! $page->section || ! $page->section->book) {
            return null;
        }

        $bookPath = rawurlencode($page->section->book->slug ?: (string) $page->section->book_id);

        return "/book/{$bookPath}/read/{$page->section_id}/{$page->id}";
    }
}
