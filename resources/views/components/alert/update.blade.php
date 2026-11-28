@props(['title' => null, 'message' => null, 'yes' => null, 'no' => null])

@php
    $text = app(\App\Services\Alert\AlertTextService::class)->get('update', compact('title', 'message', 'yes', 'no'));
@endphp

<template data-alert="update">
    <div class="alert-dlg" role="alertdialog" aria-modal="true">
        <div class="alert-icw q">
            <x-master-komponen::icon name="info" />
        </div>
        <h2 class="alert-t">{{ $text['title'] }}</h2>
        <p class="alert-m">{{ $text['message'] }}</p>
        <div class="alert-f">
            <button type="button" class="alert-btn" data-r="0">{{ $text['no'] }}</button>
            <button type="button" class="alert-btn go" data-r="1" data-f>{{ $text['yes'] }}</button>
        </div>
    </div>
</template>
