<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FollowApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_follow_unfollow_and_list_followers(): void
    {
        $reader = User::factory()->create(['role' => 'reader']);
        $author = User::factory()->create(['role' => 'author']);

        Sanctum::actingAs($reader);

        $this->postJson('/api/follows', ['following_id' => $author->id])
            ->assertCreated();

        $this->getJson("/api/follows/{$author->id}/followers")
            ->assertOk()
            ->assertJsonPath('meta.total', 1);

        $this->deleteJson("/api/follows/{$author->id}")
            ->assertOk();

        $this->getJson("/api/follows/{$author->id}/followers")
            ->assertOk()
            ->assertJsonPath('meta.total', 0);
    }
}
