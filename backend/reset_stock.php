<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Resetting stock and cart...\n";

// Reset stock to 100
\App\Models\Product::where('id', 1)->update(['stock' => 100]);
echo "✓ Product stock reset to 100\n";

// Clear all cart items
\App\Models\CartItem::truncate();
echo "✓ All cart items cleared\n";

// Clear old orders (reverse order for foreign keys)
\App\Models\Payment::query()->delete();
echo "✓ Payments cleared\n";

\App\Models\OrderItem::query()->delete();
echo "✓ Order items cleared\n";

\App\Models\Order::query()->delete();
echo "✓ Orders cleared\n";

// Clear addresses except first one
\App\Models\Address::where('id', '>', 0)->delete();
echo "✓ Addresses cleared\n";

echo "\n✅ Ready for fresh test!\n";
