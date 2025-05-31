import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminOrdersPage.css'; // Подключаем стили

const API_URL = process.env.REACT_APP_API_URL;

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Получаем заказы и статус
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                console.log("Отправляем запрос с токеном:", token); // Логируем токен перед запросом

                const response = await axios.get(`${API_URL}/admin/orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Ответ от сервера:", response.data); // Логируем ответ от сервера

                if (response.data && response.data.length > 0) {
                    // Обновляем заказы, добавляем поле status_name
                    setOrders(response.data.map(order => ({
                        ...order,
                        status_name: getStatusName(order.status_id), // Определяем название статуса по его id
                    })));
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

    // Функция для получения текста статуса по его id
    const getStatusName = (statusId) => {
        switch (statusId) {
            case 1:
                return 'Просмотрено';
            case 2:
                return 'В процессе';
            case 3:
                return 'Отправлен';
            case 4:
                return 'Доставлен';
            case 5:
                return 'Отменен';
            default:
                return 'Новый';
        }
    };

    const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) return;

    try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API_URL}/admin/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Обновление состояния
        setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
        alert('Не удалось удалить заказ.');
    }
};



    // Функция для изменения статуса заказа
    const handleStatusChange = async (orderId, statusId) => {
        let cancelComment = '';

        // Если выбран статус "Отменен", запрашиваем комментарий
        if (statusId === 5) { // Статус "Отменен" имеет id 5
            cancelComment = prompt('Введите причину отмены:');
        }

        try {
            const token = localStorage.getItem('auth_token');
            const payload = cancelComment
                ? { status_id: statusId, cancel_comment: cancelComment }
                : { status_id: statusId };

            // Отправляем запрос на сервер для изменения статуса
            await axios.patch(`${API_URL}/admin/orders/${orderId}/status`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Обновляем статус в интерфейсе
            setOrders(prevOrders => prevOrders.map(order =>
                order.order_id === orderId ? { ...order, status_id: statusId, status_name: getStatusName(statusId), cancel_comment: cancelComment } : order
            ));
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
        }
    };

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
                                <p><strong>Статус:</strong> {order.status_name}</p>
                                {order.status_id === 5 && order.cancel_comment && (
                                    <div className="cancel-comment">
                                        <p><strong>Причина отмены:</strong> {order.cancel_comment}</p>
                                    </div>
                                )}
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

                                {/* Статус может быть изменен с помощью кнопок */}
                                <button
                                    className="status"
                                    onClick={() => handleStatusChange(order.order_id, 1)} // Новый
                                >
                                    Просмотрено
                                </button>

                                <button
                                    className="status"
                                    onClick={() => handleStatusChange(order.order_id, 2)} // В процессе
                                >
                                    В процессе
                                </button>

                                <button
                                    className="status"
                                    onClick={() => handleStatusChange(order.order_id, 3)} // Отправлен
                                >
                                    Отправлен
                                </button>

                                <button
                                    className="status"
                                    onClick={() => handleStatusChange(order.order_id, 4)} // Доставлен
                                >
                                    Доставлен
                                </button>

                                <button
                                    className="status"
                                    onClick={() => handleStatusChange(order.order_id, 5)} // Отменен
                                >
                                    Отменен
                                </button>

                                {/* Дополнительные действия */}
                                <button className="delete-order" onClick={() => handleDeleteOrder(order.order_id)}>
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
