import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' или 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/api/${mode === 'login' ? 'login' : 'register'}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login'
          ? { email, password }
          : { email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || 'Ошибка');
        return;
      }

      setStatus(data.message || 'Успешно');
      if (mode === 'login' && data.token) {
        localStorage.setItem('auth_token', data.token);
        navigate('/productList');
      }
    } catch (err) {
      console.error(err);
      setStatus('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>

        {mode === 'register' && (
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <p className="status">{status}</p>

        <div className="switch-mode">
          {mode === 'login' ? (
            <p>Нет аккаунта? <span onClick={() => setMode('register')}>Регистрация</span></p>
          ) : (
            <p>Уже есть аккаунт? <span onClick={() => setMode('login')}>Войти</span></p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Auth;
