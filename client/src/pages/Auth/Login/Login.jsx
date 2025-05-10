import React, { useState } from 'react';
import '../auth.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        navigate('/productList');
      } else {
        setStatus(data.message || 'Ошибка');
      }
    } catch (err) {
      setStatus('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вход</h2>

        <label>Логин (Email)<span className="required">*</span></label>
        <input name="email" type="email" required onChange={handleChange} value={form.email} />

        <label>Пароль<span className="required">*</span></label>
        <input name="password" type="password" required onChange={handleChange} value={form.password} />

        <button type="submit">Войти</button>
        <p className="status">{status}</p>
              <p className="note"><span className="required">*</span> — обязательные поля</p>
              <p style={{ marginTop: '1rem', textAlign: 'center' }}>
  Нет аккаунта? <Link to="/register" style={{ color: '#c62828' }}>Зарегистрироваться</Link>
</p>
      </form>
    </div>
  );
};

export default Login;
