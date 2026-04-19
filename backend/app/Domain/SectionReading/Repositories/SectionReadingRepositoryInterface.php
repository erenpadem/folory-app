<?php

namespace App\Domain\SectionReading\Repositories;

use App\Domain\SectionReading\Entities\SectionReading;

interface SectionReadingRepositoryInterface
{
    public function findById(int $id): ?SectionReading;
    public function findByUserIdAndSectionId(int $userId, int $sectionId): ?SectionReading;
    public function findByUserId(int $userId, int $perPage = 15);
    public function create(SectionReading $sectionReading): SectionReading;
    public function update(SectionReading $sectionReading): SectionReading;
    public function delete(int $id): bool;
}

