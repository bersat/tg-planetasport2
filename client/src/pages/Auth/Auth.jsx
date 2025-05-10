import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';

const Auth = () => {
  const [status, setStatus] = useState('Ожидание...');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { tg, user: tgUser } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tgUser) {
      setStatus('Ошибка: не удалось получить данные Telegram');
      return;
    }

    setUser(tgUser);
    tg.MainButton.setText('Войти в магазин');
    tg.MainButton.hide();

    const handleAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth`, {
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
  }, [tg, tgUser]);

  useEffect(() => {
    if (isAuthenticated) {
      tg.MainButton.onClick(() => {
        navigate('/productList');
      });
    }
  }, [isAuthenticated, tg, navigate]);

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
