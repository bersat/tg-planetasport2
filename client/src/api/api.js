import axios from 'axios';

// Устанавливаем базовый URL для API
const API_URL = process.env.REACT_APP_API_URL;

// Получение всех категорий
export const getCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/categories`);  // Используем axios
        return response.data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
};

// Получение подкатегорий
export const getSubcategories = async (categoryId) => {
    try {
        const response = await axios.get(`${API_URL}/api/subcategories?parentId=${categoryId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении подкатегорий:', error);
    }
};

// Получение товаров
// В api.js
export const getProducts = async (categoryId, genderCategoryId, subcategoryId) => {
    try {
        // Запрос с параметрами
        const response = await axios.get(`${API_URL}/api/products`, {
            params: {
                categoryId: categoryId,
                genderCategoryId: genderCategoryId,
                subcategoryId: subcategoryId
            }
        });
        return response.data;  // Возвращаем данные, если запрос успешен
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        return [];  // Возвращаем пустой массив, если произошла ошибка
    }
};




// Получение подробной информации о товаре
export const getProductDetails = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/api/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении подробной информации о товаре:', error);
    }
};

// Создание нового товара
export const createProduct = async (productData, token) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('category', productData.category); // строка
    formData.append('brand', productData.brand);       // строка
    formData.append('type', productData.type);
    formData.append('is_on_sale', productData.is_on_sale);

    productData.images.forEach((image) => {
        formData.append('images', image);
    });

    try {
        const response = await axios.post(`${API_URL}/products`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании товара:', error);
    }
};
