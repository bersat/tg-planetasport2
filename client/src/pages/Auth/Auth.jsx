import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [status, setStatus] = useState('Ожидание...');
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const tg = window.Telegram.WebApp;
        const tgUser = tg?.initDataUnsafe?.user;

        if (!tgUser) {
            setStatus('Ошибка: не удалось получить данные Telegram');
            console.log('Ошибка: не удалось получить данные Telegram');
            return;
        }

        setUser(tgUser);
        tg.MainButton.setText('Войти в магазин');
        tg.MainButton.hide(); // скрываем кнопку до успешной авторизации

        const handleAuth = async () => {
            try {
                const response = await fetch('https://155afc9afa96a74240ad93c4204c0db6.serveo.net/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegram_id: tgUser.id,
                        username: tgUser.username,
                        first_name: tgUser.first_name,
                        last_name: tgUser.last_name,
                    }),
                });

                const data = await response.json();
                console.log('Ответ от сервера:', data);

                if (response.ok) {
                    setStatus(data.message);
                    localStorage.setItem('auth_token', data.token);
                    setIsAuthenticated(true);
                    tg.MainButton.show();
                } else {
                    setStatus('Ошибка: ' + data.message);
                    tg.MainButton.hide();
                }
            } catch (err) {
                console.error('Ошибка при подключении к серверу:', err);
                setStatus('Ошибка при подключении к серверу');
                tg.MainButton.hide();
            }
        };

        tg.MainButton.onClick(handleAuth);

        return () => {
            tg.MainButton.offClick(handleAuth);
            tg.MainButton.hide();
        };
    }, []);

    useEffect(() => {
        const tg = window.Telegram.WebApp;
        if (isAuthenticated) {
            tg.MainButton.onClick(() => {
                navigate('/products'); // переходим на страницу товаров
            });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Добро пожаловать!</h2>
            {user && (
                <p>
                    Вы вошли как: <b>{user.first_name} {user.last_name || ''}</b> (@{user.username})
                </p>
            )}
            <p>{status}</p>
        </div>
    );
};

export default Auth;
