<?php

use App\Http\Controllers\Admin\AdminPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfilePortalController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\SitePageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SitePageController::class, 'home'])->name('home');
Route::get('/about', [SitePageController::class, 'about'])->name('about');
Route::get('/directions', [SitePageController::class, 'directions'])->name('directions');
Route::get('/schedule', [SitePageController::class, 'schedule'])->name('schedule');
Route::get('/gallery', [SitePageController::class, 'gallery'])->name('gallery');
Route::get('/blog', [SitePageController::class, 'blog'])->name('blog');
Route::get('/blog/{slug}', [SitePageController::class, 'blogPost'])->name('blog.post');
Route::get('/prices', [SitePageController::class, 'prices'])->name('prices');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('seo.robots');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('/dashboard', fn () => redirect()->route('profile.show'))->name('dashboard');
    Route::get('/profile', [ProfilePortalController::class, 'show'])->name('profile.show');
});

Route::middleware('auth')->group(function (): void {
    Route::get('/profile/settings', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/settings', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/settings', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('admin')->middleware(['auth', 'admin'])->group(function (): void {
    Route::get('/', [AdminPageController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/applications', [AdminPageController::class, 'applications'])->name('admin.applications');
    Route::get('/groups', [AdminPageController::class, 'groups'])->name('admin.groups');
    Route::get('/schedule', [AdminPageController::class, 'schedule'])->name('admin.schedule');
    Route::get('/gallery', [AdminPageController::class, 'gallery'])->name('admin.gallery');
    Route::get('/about', [AdminPageController::class, 'about'])->name('admin.about');
    Route::get('/blog', [AdminPageController::class, 'blog'])->name('admin.blog');
    Route::get('/users', [AdminPageController::class, 'users'])->name('admin.users');
    Route::get('/sections', [AdminPageController::class, 'sections'])->name('admin.sections');
    Route::get('/section-news', [AdminPageController::class, 'sectionNews'])->name('admin.section-news');
    Route::get('/support', [AdminPageController::class, 'support'])->name('admin.support');
    Route::get('/billing', [AdminPageController::class, 'billing'])->name('admin.billing');
});

require __DIR__.'/auth.php';
