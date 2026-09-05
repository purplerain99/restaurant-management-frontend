import {
    computed,
    ref,
} from 'vue'

import {
    defineStore,
} from 'pinia'

import {
    createOrder,
} from '../services/order'

export const useCartStore =
    defineStore('cart', () => {

        const items = ref([])

        const tableCode = ref(
            localStorage.getItem(
                'customer_table_code'
            )
        )


        const totalQuantity =
            computed(() => {

                return items.value.reduce(
                    (
                        total,
                        item
                    ) => total +
                        item.quantity,
                    0
                )
            })


        const subtotal =
            computed(() => {

                return items.value.reduce(
                    (
                        total,
                        item
                    ) => total +
                        (
                            Number(
                                item.price
                            ) *
                            item.quantity
                        ),
                    0
                )
            })


        const setTable = (code) => {

            tableCode.value = code

            localStorage.setItem(
                'customer_table_code',
                code
            )
        }


        const addItem = (
            menuItem
        ) => {

            const existing =
                items.value.find(
                    item =>
                        item.id ===
                        menuItem.id
                )

            if (existing) {

                existing.quantity++

                return
            }

            items.value.push({

                id: menuItem.id,

                name: menuItem.name,

                price: Number(
                    menuItem.price
                ),

                image:
                    menuItem.image,

                quantity: 1,

                special_note: '',
            })
        }


        const increase = (
            id
        ) => {

            const item =
                items.value.find(
                    item =>
                        item.id === id
                )

            if (item) {
                item.quantity++
            }
        }


        const decrease = (
            id
        ) => {

            const item =
                items.value.find(
                    item =>
                        item.id === id
                )

            if (!item) {
                return
            }

            if (
                item.quantity <= 1
            ) {

                removeItem(id)

                return
            }

            item.quantity--
        }


        const removeItem = (
            id
        ) => {

            items.value =
                items.value.filter(
                    item =>
                        item.id !== id
                )
        }


        const clear = () => {

            items.value = []

        }


        // Checkout 

        const checkout = async (
            orderNote
        ) => {

            if (
                !tableCode.value
            ) {
                throw new Error(
                    'Table Code မရှိပါ။'
                )
            }

            if (
                items.value.length === 0
            ) {
                throw new Error(
                    'Cart ထဲမှာ item မရှိပါ။'
                )
            }

            const payload = {

                table_code:
                    tableCode.value,

                items:
                    items.value.map(item => ({
                        menu_item_id:
                            item.id,

                        quantity:
                            item.quantity,

                        special_note:
                            item.special_note
                            || null,
                    })),

                note:
                    orderNote
                    || null,
            }

            const response =
                await createOrder(
                    payload
                )

            return response
        }


        return {

            items,

            tableCode,

            totalQuantity,

            subtotal,

            setTable,

            addItem,

            increase,

            decrease,

            removeItem,

            clear,

            checkout,
        }
    })


