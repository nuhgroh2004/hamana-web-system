@props(['title' => null, 'message' => null])

@php
    $text = app(\App\Services\Alert\AlertTextService::class)->get('success', compact('title', 'message'));
@endphp

<template data-alert="success" data-kind="ok" data-ms="3000">
    <div class="alert-dlg" role="alertdialog" aria-modal="true">
        <div class="alert-icw ok">
            <x-master-komponen::icon name="check" />
        </div>
        <h2 class="alert-t">{{ $text['title'] }}</h2>
        <p class="alert-m">{{ $text['message'] }}</p>
        <div class="alert-f">
            <button type="button" class="alert-btn go" data-r="1">{{ $text['ok'] }}</button>
        </div>
        <div class="alert-bar"></div>
    </div>
</template>
