import React, { useState, useEffect } from 'react';

interface Product {
  productId: number;
  nome: string;
  descricao: string;
  preco: string;
  estoque: number;
  supplierId?: number; // Optional supplierId to link the product to a supplier
}

interface Supplier {
  supplierId: number;
  nome: string;
}

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: 1,
    supplierId: '', // Track supplierId when adding product
  });
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // State to store suppliers

  // Fetch products and suppliers from API when the page loads
  useEffect(() => {
    // Fetch products
    fetch('http://localhost:8080/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  
    // Fetch suppliers from the API
    fetch('https://localhost:8080/supplier')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched suppliers:', data); // Log the suppliers data
        setSuppliers(data);
      })
      .catch((error) => console.error('Error fetching suppliers:', error));
  }, []);
  

  // Handle adding a new product
  const handleAddProduct = async () => {
    const { nome, descricao, preco, estoque, supplierId } = newProduct;
    if (!nome || !descricao || !preco || estoque < 1) {
      setResponseMessage('Please fill out all fields with valid values.');
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setResponseMessage('You must be logged in to add a product.');
      return;
    }

    const api_body = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        nome,
        descricao,
        preco,
        estoque,
        supplierId,
      }),
    };

    try {
      const response = await fetch('http://localhost:8080/products', api_body);
      if (response.ok) {
        const data = await response.json();
        setResponseMessage('Product added successfully!');
        setNewProduct({
          nome: '',
          descricao: '',
          preco: '',
          estoque: 1,
          supplierId: '',
        });

        // Refresh product list
        const updatedProducts = await fetch('http://localhost:8080/products').then(res => res.json());
        setProducts(updatedProducts);
      } else {
        const error = await response.json();
        setResponseMessage(error?.message || 'Failed to add product.');
      }
    } catch (error) {
      setResponseMessage('Failed to connect to the server.');
      console.error(error);
    }
  };

  // Handle input change for adding new product
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle supplier change in the dropdown
  const handleSupplierChange = (productId: number, supplierId: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.productId === productId
          ? { ...product, supplierId } // Update the supplierId for the product
          : product
      )
    );
  };
  const handleSupplierChangeForm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      supplierId: value, // Set the supplierId when a supplier is selected
    }));
  };


  // Handle inline editing of product details
  const handleEditProduct = (productId: number, field: string, value: string | number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.productId === productId
          ? { ...product, [field]: value } // Update product field with new value
          : product
      )
    );
  };

  // Handle saving the edited product
  const handleSaveProduct = async (productId: number) => {
    const productToSave = products.find((product) => product.productId === productId);
    if (!productToSave) return;

    const api_body = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productToSave),
    };

    try {
      const response = await fetch(`http://localhost:8080/products/${productId}`, api_body);
      if (response.ok) {
        setResponseMessage('Product updated successfully!');
      } else {
        const error = await response.json();
        setResponseMessage(error?.message || 'Failed to update product.');
      }
    } catch (error) {
      setResponseMessage('Failed to connect to the server.');
      console.error(error);
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = async (productId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter((product) => product.productId !== productId));
        setResponseMessage('Product deleted successfully!');
      } else {
        setResponseMessage('Failed to delete product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setResponseMessage('Failed to delete product.');
    }
  };

  return (
    <div className="mt-4">
      <h2>Available Products</h2>
      {responseMessage && <div className="alert alert-info">{responseMessage}</div>}

      {/* Add Product Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h3>Add New Product</h3>
          <div className="form-group">
            <label htmlFor="nome">Product Name:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="form-control"
              value={newProduct.nome}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Description:</label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              className="form-control"
              value={newProduct.descricao}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="preco">Price:</label>
            <input
              type="text"
              id="preco"
              name="preco"
              className="form-control"
              value={newProduct.preco}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="estoque">Stock:</label>
            <input
              type="number"
              id="estoque"
              name="estoque"
              className="form-control"
              value={newProduct.estoque}
              onChange={handleInputChange}
            />
          </div>

          {/* Supplier Selection */}
          <div className="form-group">
            <label htmlFor="supplier">Select Supplier:</label>
            <select
              id="supplier"
              className="form-control"
              value={newProduct.supplierId}
              onChange={handleSupplierChangeForm}
            >
              <option value="">Select a supplier</option>
              {suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.nome}
                  </option>
                ))
              ) : (
                <option value="" disabled>No suppliers available</option>
              )}
            </select>

          </div>

          <button className="btn btn-success" onClick={handleAddProduct}>Add Product</button>
        </div>
      </div>

      {/* Products Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Supplier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId}>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleEditProduct(product.productId, 'nome', e.target.textContent || product.nome)
                }
              >
                {product.nome}
              </td>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleEditProduct(product.productId, 'descricao', e.target.textContent || product.descricao)
                }
              >
                {product.descricao}
              </td>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleEditProduct(product.productId, 'preco', e.target.textContent || product.preco)
                }
              >
                {product.preco}
              </td>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleEditProduct(product.productId, 'estoque', parseInt(e.target.textContent || '') || product.estoque)
                }
              >
                {product.estoque}
              </td>
              <td>
                {/* Supplier Dropdown */}
                <select
                  className="form-control"
                  value={product.supplierId || ''}
                  onChange={(e) => handleSupplierChange(product.productId, Number(e.target.value))}
                >
                  <option value="">Select a supplier</option>
                  {suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <option key={supplier.supplierId} value={supplier.supplierId}>
                        {supplier.nome}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No suppliers available</option>
                  )}
                </select>
              </td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSaveProduct(product.productId)}
                >
                  Save
                </button>
                <button
                  className="btn btn-danger btn-sm ml-2"
                  onClick={() => handleDeleteProduct(product.productId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPage;
