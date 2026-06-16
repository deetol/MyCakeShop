<?php

namespace App\Http\Requests\Cart;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use App\Models\ProductSize;

class AddToCartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by auth:sanctum middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'product_size_id' => 'nullable|exists:product_sizes,id',
            'quantity' => 'required|integer|min:1|max:100',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Product ID is required',
            'product_id.exists' => 'Product not found',
            'product_size_id.exists' => 'Product size not found',
            'quantity.required' => 'Quantity is required',
            'quantity.integer' => 'Quantity must be a number',
            'quantity.min' => 'Quantity must be at least 1',
            'quantity.max' => 'Quantity cannot exceed 100',
        ];
    }

    public function withValidator($validator): void
    {
    $validator->after(function ($validator) {

        $productId = $this->input('product_id');
        $sizeId = $this->input('product_size_id');

        if (!$sizeId) {
            return;
        }

        $sizeBelongsToProduct = ProductSize::where('id', $sizeId)
            ->where('product_id', $productId)
            ->exists();

        if (!$sizeBelongsToProduct) {
            $validator->errors()->add(
                'product_size_id',
                'Selected size does not belong to this product.'
            );
        }
    });
}
}
