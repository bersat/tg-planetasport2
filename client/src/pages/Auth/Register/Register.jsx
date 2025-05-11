import React, { useState } from 'react';
import '../auth.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/register', form);

      if (res.status === 201) {
        setStatus('Регистрация прошла успешно. Перенаправляем...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setStatus(res.data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      setStatus(err.response?.data?.message || 'Ошибка соединения с сервером');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Регистрация</h2>

        <label>ФИО<span className="required">*</span></label>
        <input
          name="full_name"
          type="text"
          required
          onChange={handleChange}
          value={form.full_name}
        />

        <label>Email<span className="required">*</span></label>
        <input
          name="email"
          type="email"
          required
          onChange={handleChange}
          value={form.email}
        />

        <label>Телефон<span className="required">*</span></label>
        <input
          name="phone"
          type="tel"
          required
          onChange={handleChange}
          value={form.phone}
        />

        <label>Пароль<span className="required">*</span></label>
        <input
          name="password"
          type="password"
          required
          onChange={handleChange}
          value={form.password}
        />

        <button type="submit">Зарегистрироваться</button>
        <p className="status">{status}</p>
        <p className="note"><span className="required">*</span> — обязательные поля</p>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: '#c62828' }}>Войти</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
