import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createOrder } from '@/services/order'

export const useCartStore = defineStore('cart', () => {
    const tableCode = ref();
    const items = ref([])
    const orderNote = ref('')

    /**
     * Table-specific localStorage key
     */
    const storageKey = computed(() => {
        if (!tableCode.value) {
            return null
        }

        return `restaurant_cart_${tableCode.value}`
    })

    /**
     * Save current cart to localStorage
     */
    const saveCart = () => {
        if (!storageKey.value) {
            return
        }

        localStorage.setItem(
            storageKey.value,
            JSON.stringify({
                items: items.value,
                orderNote: orderNote.value,
            }),
        )
    }

    /**
     * Load cart from localStorage
     */
    const loadCart = () => {
        if (!storageKey.value) {
            return
        }

        const savedCart = localStorage.getItem(storageKey.value)

        if (!savedCart) {
            items.value = []
            orderNote.value = ''
            return
        }

        try {
            const parsed = JSON.parse(savedCart)

            items.value = Array.isArray(parsed.items)
                ? parsed.items
                : []

            orderNote.value = parsed.orderNote ?? ''
        } catch (error) {
            console.error('Failed to parse cart:', error)

            items.value = []
            orderNote.value = ''
        }
    }

    /**
     * Set current restaurant table
     */
    const setTable = (code) => {
        if (!code) {
            return
        }

        tableCode.value = code

        // Refresh ဖြစ်ပြီးနောက် localStorage ထဲက cart ပြန်ယူ
        loadCart()
    }

    /**
     * Add item to cart
     */
    const addItem = (menuItem) => {
        const existingItem = items.value.find(
            item => item.id === menuItem.id,
        )

        if (existingItem) {
            existingItem.quantity += 1
        } else {
            items.value.push({
                id: menuItem.id,
                name: menuItem.name,
                price: Number(menuItem.price),
                image: menuItem.image ?? null,
                quantity: 1,
                special_note: '',
            })
        }

        saveCart()
    }

    /**
     * Increase quantity
     */
    const increaseQuantity = (id) => {
        const item = items.value.find(
            item => item.id === id,
        )

        if (!item) {
            return
        }

        item.quantity += 1

        saveCart()
    }

    /**
     * Decrease quantity
     */
    const decreaseQuantity = (id) => {
        const item = items.value.find(
            item => item.id === id,
        )

        if (!item) {
            return
        }

        if (item.quantity > 1) {
            item.quantity -= 1
        } else {
            removeItem(id)
            return
        }

        saveCart()
    }

    /**
     * Remove item
     */
    const removeItem = (id) => {
        items.value = items.value.filter(
            item => item.id !== id,
        )

        saveCart()
    }

    /**
     * Update special note
     */
    const updateSpecialNote = (id, note) => {
        const item = items.value.find(
            item => item.id === id,
        )

        if (!item) {
            return
        }

        item.special_note = note

        saveCart()
    }

    /**
     * Update order note
     */
    const setOrderNote = (note) => {
        orderNote.value = note

        saveCart()
    }

    /**
     * Clear cart
     */
    const clearCart = () => {
        items.value = []
        orderNote.value = ''

        if (storageKey.value) {
            localStorage.removeItem(storageKey.value)
        }
    }

    /**
     * Cart total quantity
     */
    const totalQuantity = computed(() => {
        return items.value.reduce(
            (total, item) => total + Number(item.quantity),
            0,
        )
    })

    /**
     * Cart subtotal
     *
     * Backend will recalculate the real amount.
     * This is only for frontend display.
     */
    const subtotal = computed(() => {
        return items.value.reduce(
            (total, item) =>
                total +
                Number(item.price) * Number(item.quantity),
            0,
        )
    })

    /**
     * Checkout
     */
    const checkout = async (orderData = {}) => {
        const payload = {
            table_code: tableCode.value,

            guest_name: orderData.guest_name || null,
            guest_phone: orderData.guest_phone || null,
            note: orderData.note || null,

            items: items.value.map((item) => ({
                menu_item_id: item.id,
                quantity: Number(item.quantity),
                special_note: item.special_note || null,
            })),
        };

        console.log("CHECKOUT PAYLOAD:", payload);

        const response = await createOrder(payload);

        // Order create အောင်မြင်မှ cart ရှင်း
        clearCart();

        return response;
    };

    const placeOrder = async () => {
        if (!cart.items.length) {
            return;
        }

        ordering.value = true;
        errorMessage.value = "";

        try {
            const response = await cart.checkout({
                guest_name: guestName.value,
                guest_phone: guestPhone.value,
                note: orderNote.value,
            });

            const order = response.data?.data;

            if (!order?.order_number) {
                throw new Error(
                    "Order information မရရှိပါ။"
                );
            }

            await router.replace({
                name: "customer.order-slip",
                params: {
                    table_code: cart.tableCode,
                    order_number: order.order_number,
                },
            });
        } catch (error) {
            console.error("ORDER ERROR:", error);

            errorMessage.value =
                error.response?.data?.message ||
                error.message ||
                "Order တင်၍မရပါ။";
        } finally {
            ordering.value = false;
        }
    };

    return {
        tableCode,
        items,
        orderNote,

        totalQuantity,
        subtotal,

        setTable,
        loadCart,
        saveCart,

        addItem,
        increaseQuantity,
        decreaseQuantity,
        removeItem,

        updateSpecialNote,
        setOrderNote,

        clearCart,
        checkout,

        placeOrder,
    }
})