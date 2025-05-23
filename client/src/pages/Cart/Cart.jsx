import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/CartContext';
import { FaTrash } from 'react-icons/fa';  // Иконка удаления
import './cart.css';

function Cart() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart, updateQuantity } = useCart();

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="cart">
      <h1>Корзина</h1>
      {cart.length === 0 ? (
        <p>Ваша корзина пуста</p>
      ) : (
        <div>
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image_url} alt={item.title} />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <span>{item.price} ₽</span>
                  <div className="quantity">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  {/* Иконка удаления товара */}
                  <div className="remove-icon" onClick={() => removeFromCart(item.id)}>
                    <FaTrash className="icon-remove" />
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
