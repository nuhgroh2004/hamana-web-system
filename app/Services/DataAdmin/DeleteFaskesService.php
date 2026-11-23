<?php

namespace App\Services\DataAdmin;

use App\Models\FaskesBpjs;

class DeleteFaskesService
{
    /**
     * Delete a BPJS health facility.
     */
    public function handle(FaskesBpjs $faskes): void
    {
        $faskes->delete();
    }
}
