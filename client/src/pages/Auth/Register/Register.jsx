import React, { useState } from 'react';
import '../auth.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Регулярные выражения для валидации
const nameRegex = /^([А-ЯЁ][а-яё]+)(\s[А-ЯЁ][а-яё]+){1,2}$/; // ФИО с заглавными буквами в начале и двумя или тремя словами (Фамилия, Имя, Отчество)
const emailRegex = /^[a-zA-Z0-9._%+-]+@(mail.ru|yandex.ru|gmail.com)$/; // Проверка на почту mail.ru, yandex.ru, gmail.com
const phoneRegex = /^\+7\d{10}$/; // Проверка на телефон +7 и 10 цифр
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/; // Пароль (не менее 6 символов, заглавная, спец. символ)

const Register = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '+7', // Изначально +7
    password: ''
  });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Обработчик для телефона, чтобы автоматически подставлять +7
  const handlePhoneChange = (e) => {
    let value = e.target.value;

    // Если первое значение не пустое, добавляем +7
    if (!value.startsWith('+7')) {
      value = '+7' + value.replace(/[^\d]/g, ''); // Убираем все символы, кроме цифр
    } else {
      // В случае, если номер уже начинается с +7, просто удаляем все символы, кроме цифр
      value = '+7' + value.slice(2).replace(/[^\d]/g, '');
    }

    // Ограничиваем длину номера до 12 символов (+7 + 10 цифр)
    if (value.length > 12) {
      value = value.slice(0, 12);
    }

    setForm(prev => ({ ...prev, phone: value }));
  };

  const validateForm = () => {
    const { full_name, email, phone, password } = form;

    // Проверка ФИО: должны быть Фамилия, Имя, и, если есть, Отчество с заглавными буквами
    if (!nameRegex.test(full_name)) {
      setStatus('ФИО должно быть написано с заглавных букв, с фамилией, именем и, если есть, отчеством.');
      return false;
    }

    // Проверка email
    if (!emailRegex.test(email)) {
      setStatus('Email должен быть в одном из следующих форматов: mail.ru, yandex.ru, gmail.com');
      return false;
    }

    // Проверка телефона
    if (!phoneRegex.test(phone)) {
      setStatus('Телефон должен быть в формате +7XXXXXXXXXX.');
      return false;
    }

    // Проверка пароля
    if (!passwordRegex.test(password)) {
      setStatus('Пароль должен быть не менее 6 символов, с заглавной буквой и хотя бы одним специальным знаком.');
      return false;
    }

    // Все проверки пройдены
    setStatus('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
          onChange={handlePhoneChange}
          value={form.phone}
          placeholder="+7"
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
