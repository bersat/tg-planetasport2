import React, { useState } from "react";
import './productlist.css';
import ProductItem from "../ProductItem/ProductItem";
import { useTelegram } from "../../hooks/useTelegram";


const products = [
    { id: '1', title: 'Джинсы', price: 5000, description: 'Синего цвета, прямые' },
    { id: '2', title: 'Куртка', price: 6000, description: 'Синего цвета, прямые'},
    { id: '3', title: 'Джинсы 2', price: 3000, description: 'Синего цвета, прямые'},
    { id: '4', title: 'Куртка 8', price: 10000, description: 'Синего цвета, прямые' },
    { id: '5', title: 'Джинсы 3', price: 4200, description: 'Синего цвета, прямые' },
    { id: '6', title: 'Куртка 7', price: 20000, description: 'Синего цвета, прямые' },
    { id: '7', title: 'Джинсы 4', price: 15000, description: 'Синего цвета, прямые' },
    { id: '8', title: 'Куртка 5', price: 19999, description: 'Синего цвета, прямые' },
    { id: '9', title: 'Джинсы 10', price: 3700, description: 'Синего цвета, прямые' },
    { id: '10', title: 'Толстовка', price: 4499, description: 'Синего цвета, прямые'},
]

const getTotalPrice = (items =[]) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

const ProductList = () => {
    const [addedItems, setAddedItems] = useState([])
    const { tg } = useTelegram();
    const onAdd = (product) => {
        const alreadyAdded = addedItems.find(item => item.id === product.id);
        let newItems = [];

        if (alreadyAdded) {
            newItems = addedItems.filter(item => item.id !== product.id);
        } else {
            newItems = [...addedItems, product];
        }

        setAddedItems(newItems)

        if (newItems.length === 0) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
            tg.MainButton.setParams({
                text: `Купить ${getTotalPrice(newItems)}`
            })
        }
    }
    return (
        <div className={'list'}>
            {products.map(item => (
                <ProductItem
                    product={item}
                    onAdd={onAdd}
                    className={'item'}
                />
            ))}
        </div>
    )
}

export default ProductList;