<?php

namespace App\Http\Requests\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'address_id'         => 'required|exists:addresses,id',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'payment_method_id'  => 'required|exists:payment_methods,id',
            'payment_type'       => 'nullable|in:full,dp',
            'notes'              => 'nullable|string|max:1000',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'address_id.required' => 'Alamat pengiriman harus dipilih',
            'address_id.exists' => 'Alamat tidak valid',
            'shipping_method_id.required' => 'Metode pengiriman harus dipilih',
            'shipping_method_id.exists' => 'Metode pengiriman tidak valid',
            'payment_method_id.required' => 'Metode pembayaran harus dipilih',
            'payment_method_id.exists' => 'Metode pembayaran tidak valid',
        ];
    }
}
