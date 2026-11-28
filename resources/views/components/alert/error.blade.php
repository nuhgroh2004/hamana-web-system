@props(['title' => null, 'message' => null])

@php
    $text = app(\App\Services\Alert\AlertTextService::class)->get('error', compact('title', 'message'));
@endphp

<template data-alert="error" data-kind="er">
    <div class="alert-dlg shake" role="alertdialog" aria-modal="true">
        <div class="alert-icw er">
            <x-master-komponen::icon name="close" />
        </div>
        <h2 class="alert-t">{{ $text['title'] }}</h2>
        <p class="alert-m">{{ $text['message'] }}</p>
        <div class="alert-f">
            <button type="button" class="alert-btn dgb" data-r="1">{{ $text['ok'] }}</button>
        </div>
    </div>
</template>
