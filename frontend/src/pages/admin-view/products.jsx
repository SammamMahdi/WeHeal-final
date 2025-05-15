import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', discountPrice: '', category: '', imageUrl: '', stock: '', weight: '', company: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/shop/products', { withCredentials: true });
      if (res.data && res.data.products) setProducts(res.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/shop/products', formData, { withCredentials: true });
      setFormData({ name: '', description: '', price: '', discountPrice: '', category: '', imageUrl: '', stock: '', weight: '', company: '' });
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Products Management</h1>
      <form onSubmit={handleAdd} style={{ marginBottom: '1rem' }}>
        {['name','description','price','discountPrice','category','imageUrl','stock','weight','company'].map(field => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={formData[field]}
            onChange={handleChange}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            required
          />
        ))}
        <button type="submit">Add Product</button>
      </form>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Weight</th><th>Company</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.discountPrice ? `${p.discountPrice} (orig ${p.price})` : p.price}</td>
              <td>{p.stock}</td>
              <td>{p.weight}</td>
              <td>{p.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts; 