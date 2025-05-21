import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/CartContext';
import './cart.css';

function Cart() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

 const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);


  return (
    <div className="cart">
      <h1>Корзина</h1>
      {cart.length === 0 ? (
        <p>Ваша корзина пуста</p>
      ) : (
        <div>
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <img src={item.image_url} alt={item.title} />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <span>{item.price} ₽</span>
                  <div className="quantity">
                    <button onClick={() => removeFromCart(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="total">
            <span>Итого: {totalPrice} ₽</span>
            <button onClick={clearCart}>Очистить корзину</button>
            <button onClick={() => navigate('/')}>Перейти к покупкам</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
