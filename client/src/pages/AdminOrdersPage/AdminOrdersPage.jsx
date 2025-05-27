import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminOrdersPage.css'; // Подключаем стили

const API_BASE = 'http://localhost:5000/api';

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            console.log("Отправляем запрос с токеном:", token); // Логируем токен перед запросом

            const response = await axios.get(`${API_BASE}/admin/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Ответ от сервера:", response.data); // Логируем ответ от сервера

            if (response.data && response.data.length > 0) {
                setOrders(response.data); // Устанавливаем данные заказов
            } else {
                setOrders([]); // Если нет заказов, устанавливаем пустой массив
            }
        } catch (error) {
            console.error('Ошибка при загрузке заказов:', error);
            if (error.response && error.response.status === 403) {
                alert('Доступ запрещен');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    fetchOrders();
}, [navigate]);



    if (loading) {
        return <p>Загрузка...</p>;
    }

    return (
        <div className="admin-orders">
            <h1>Админ панель - Все заказы</h1>
            {orders.length === 0 ? (
                <p>Нет заказов</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.order_id} className="order-item">
                            <div className="order-header">
                                <h4>Номер заказа: {order.order_id}</h4>
                                <p>Дата заказа: {new Date(order.created_at).toLocaleString()}</p>
                                <p>Имя клиента: {order.full_name}</p>
                                <p>Email: {order.email}</p>
                                <span>Сумма: {order.total_price} ₽</span>
                            </div>

                            <div className="order-items">
                                <h5>Товары:</h5>
                                {/* Добавляем проверку на наличие массива товаров */}
                                {Array.isArray(order.items) && order.items.length > 0 ? (
                                    <ul>
                                        {order.items.map((item, index) => (
                                            <li key={index} className="order-item-details">
                                                <p>Наименование: {item.product_name}</p>
                                                <p>Количество: {item.quantity}</p>
                                                <p>Цена: {item.price} ₽</p>
                                                <p>Размер: {item.size || 'Не указан'}</p>
                                                <p>Цвет: {item.color || 'Не указан'}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Товары не найдены</p>
                                )}
                            </div>

                            <div className="actions">
                                <button
                                    className="view-order"
                                    onClick={() => navigate(`/order/${order.order_id}`)}
                                >
                                    Просмотр
                                </button>
                                <button className="status">
                                    Изменить статус
                                </button>
                                <button className="delete-order">
                                    Удалить
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AdminOrdersPage;
