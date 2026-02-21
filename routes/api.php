<?php

use App\Http\Controllers\Api\V1\Admin\SupportController as AdminSupportController;
use App\Http\Controllers\Api\V1\Admin\ApplicationsController as AdminApplicationsController;
use App\Http\Controllers\Api\V1\Admin\AboutController as AdminAboutController;
use App\Http\Controllers\Api\V1\Admin\BillingController as AdminBillingController;
use App\Http\Controllers\Api\V1\Admin\BlogPostsController as AdminBlogPostsController;
use App\Http\Controllers\Api\V1\Admin\BlogSettingsController as AdminBlogSettingsController;
use App\Http\Controllers\Api\V1\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\V1\Admin\GroupsController as AdminGroupsController;
use App\Http\Controllers\Api\V1\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Api\V1\Admin\SectionNewsController as AdminSectionNewsController;
use App\Http\Controllers\Api\V1\Admin\SectionsController as AdminSectionsController;
use App\Http\Controllers\Api\V1\Admin\SupportConversationsController as AdminSupportConversationsController;
use App\Http\Controllers\Api\V1\Admin\UsersController as AdminUsersController;
use App\Http\Controllers\Api\V1\Admin\TelegramLinksController as AdminTelegramLinksController;
use App\Http\Controllers\Api\V1\Admin\TelegramSettingsController as AdminTelegramSettingsController;
use App\Http\Controllers\Api\V1\EnrollmentController;
use App\Http\Controllers\Api\V1\PaymentsController;
use App\Http\Controllers\Api\V1\ProfileDataController;
use App\Http\Controllers\Api\V1\PublicApplicationController;
use App\Http\Controllers\Api\V1\SupportController;
use App\Http\Controllers\Api\V1\TelegramWebhookController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;

Route::prefix('v1')->middleware('web')->group(function (): void {
    Route::middleware('auth')->group(function (): void {
        Route::post('/payments/checkout', [PaymentsController::class, 'checkout']);
        Route::post('/enrollments/apply', [EnrollmentController::class, 'apply']);

        Route::get('/profile/enrollments', [ProfileDataController::class, 'enrollments']);
        Route::get('/profile/schedule', [ProfileDataController::class, 'schedule']);
        Route::get('/profile/payments', [ProfileDataController::class, 'payments']);
        Route::get('/profile/section-news', [ProfileDataController::class, 'sectionNews']);

        Route::post('/admin/support/messages', [AdminSupportController::class, 'store'])
            ->middleware('admin')
            ->withoutMiddleware([ValidateCsrfToken::class]);

        Route::prefix('/admin')
            ->middleware('admin')
            ->withoutMiddleware([ValidateCsrfToken::class])
            ->group(function (): void {
            Route::get('/applications', [AdminApplicationsController::class, 'index']);
            Route::patch('/applications/{application}', [AdminApplicationsController::class, 'update']);
            Route::post('/applications/{application}/auto-assign', [AdminApplicationsController::class, 'autoAssign']);
            Route::post('/applications/auto-assign-all', [AdminApplicationsController::class, 'autoAssignAll']);

            Route::get('/sections', [AdminSectionsController::class, 'index']);
            Route::post('/sections', [AdminSectionsController::class, 'store']);
            Route::patch('/sections/{section}', [AdminSectionsController::class, 'update']);
            Route::delete('/sections/{section}', [AdminSectionsController::class, 'destroy']);

            Route::get('/groups', [AdminGroupsController::class, 'index']);
            Route::post('/groups', [AdminGroupsController::class, 'store']);
            Route::patch('/groups/{group}', [AdminGroupsController::class, 'update']);
            Route::delete('/groups/{group}', [AdminGroupsController::class, 'destroy']);

            Route::get('/schedule', [AdminScheduleController::class, 'index']);
            Route::post('/schedule', [AdminScheduleController::class, 'store']);
            Route::patch('/schedule/{item}', [AdminScheduleController::class, 'update']);
            Route::delete('/schedule/{item}', [AdminScheduleController::class, 'destroy']);

            Route::get('/section-news', [AdminSectionNewsController::class, 'index']);
            Route::post('/section-news', [AdminSectionNewsController::class, 'store']);
            Route::patch('/section-news/{item}', [AdminSectionNewsController::class, 'update']);
            Route::delete('/section-news/{item}', [AdminSectionNewsController::class, 'destroy']);

            Route::get('/blog-posts', [AdminBlogPostsController::class, 'index']);
            Route::post('/blog-posts', [AdminBlogPostsController::class, 'store']);
            Route::patch('/blog-posts/{post}', [AdminBlogPostsController::class, 'update']);
            Route::delete('/blog-posts/{post}', [AdminBlogPostsController::class, 'destroy']);
            Route::post('/blog/settings', [AdminBlogSettingsController::class, 'store']);
            Route::patch('/blog/settings/{item}', [AdminBlogSettingsController::class, 'update']);
            Route::delete('/blog/settings/{item}', [AdminBlogSettingsController::class, 'destroy']);

            Route::post('/about/team-members', [AdminAboutController::class, 'storeTeamMember']);
            Route::patch('/about/team-members/{member}', [AdminAboutController::class, 'updateTeamMember']);
            Route::delete('/about/team-members/{member}', [AdminAboutController::class, 'destroyTeamMember']);
            Route::post('/about/content', [AdminAboutController::class, 'storeContent']);
            Route::patch('/about/content/{item}', [AdminAboutController::class, 'updateContent']);
            Route::delete('/about/content/{item}', [AdminAboutController::class, 'destroyContent']);

            Route::post('/gallery/items', [AdminGalleryController::class, 'storeItem']);
            Route::patch('/gallery/items/{item}', [AdminGalleryController::class, 'updateItem']);
            Route::delete('/gallery/items/{item}', [AdminGalleryController::class, 'destroyItem']);
            Route::post('/gallery/collages', [AdminGalleryController::class, 'storeCollage']);
            Route::patch('/gallery/collages/{collage}', [AdminGalleryController::class, 'updateCollage']);
            Route::delete('/gallery/collages/{collage}', [AdminGalleryController::class, 'destroyCollage']);

            Route::patch('/users/{user}', [AdminUsersController::class, 'update']);
            Route::patch('/support/conversations/{conversation}', [AdminSupportConversationsController::class, 'update']);

            Route::patch('/billing/enrollments/{enrollment}', [AdminBillingController::class, 'updateEnrollment']);
            Route::patch('/billing/payments/{payment}', [AdminBillingController::class, 'updatePayment']);

            Route::get('/settings/telegram', [AdminTelegramSettingsController::class, 'show']);
            Route::patch('/settings/telegram', [AdminTelegramSettingsController::class, 'update']);
            Route::post('/settings/telegram/set-webhook', [AdminTelegramSettingsController::class, 'setWebhook']);

            Route::post('/telegram/links', [AdminTelegramLinksController::class, 'store']);
            Route::patch('/telegram/links/{link}', [AdminTelegramLinksController::class, 'update']);
            Route::delete('/telegram/links/{link}', [AdminTelegramLinksController::class, 'destroy']);
        });
    });

    Route::get('/support/current', [SupportController::class, 'current']);
    Route::post('/support/messages', [SupportController::class, 'store']);

    Route::post('/applications', [PublicApplicationController::class, 'store']);
});

Route::post('/v1/telegram/webhook/{secret}', [TelegramWebhookController::class, 'handle']);
