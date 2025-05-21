import React from 'react';

function ProductList({ products }) {
  return (
    <div className="product-list">
      {products.map((product) => (
        <div className="product" key={product.id}>
          <img src={product.image_url} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <div className="price">{product.price} ₽</div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
