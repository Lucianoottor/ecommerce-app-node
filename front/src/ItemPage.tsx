import React, { useState, useEffect } from 'react';

interface Product {
  productId: number;
  nome: string;
  descricao: string;
  preco: string;
  estoque: number;
}

const ItemPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // State to store products
  const [quantity, setQuantity] = useState<{ [key: number]: number }>({}); // Quantity input for each product
  const [cart, setCart] = useState<{ [key: number]: number }>({}); // Cart to track quantities
  const [responseMessage, setResponseMessage] = useState<string>(''); // Message for feedback

  // Fetch products from the API
  useEffect(() => {
    fetch('http://localhost:8080/products')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  // Handle quantity change
  const handleQuantityChange = (productId: number, value: number) => {
    if (value < 1) value = 1; // Ensure quantity cannot be less than 1
    setQuantity((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // Handle Add to Cart
  const handleAddToCart = async (productId: number, productQuantity: number) => {
    if (productQuantity <= 0) {
      setResponseMessage('Please enter a valid quantity!');
      return;
    }
  
    // Retrieve the auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setResponseMessage('You must be logged in to add items to the cart.');
      return;
    }
  
    // Prepare the request body
    const api_body = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Add the token here
      },
      body: JSON.stringify({
        productId: productId,
        quantity: productQuantity,
      }),
    };
  
    // Send a POST request to the server to add the item to the cart
    try {
      const response = await fetch('http://localhost:8080/cart/addItem', api_body);
      if (response.ok) {
        const data = await response.json();
        setResponseMessage('Product added to cart successfully!');
        
        // Update cart state locally
        setCart((prevCart) => ({
          ...prevCart,
          [productId]: (prevCart[productId] || 0) + productQuantity,
        }));
  
        // Optionally, reset the quantity input after adding to the cart
        setQuantity((prevQuantity) => ({
          ...prevQuantity,
          [productId]: 0, // Reset input for the product
        }));
      } else {
        const error = await response.json();
        setResponseMessage(error?.message || 'Failed to add to cart.');
      }
    } catch (error) {
      setResponseMessage('Failed to connect to the server.');
      console.error(error);
    }
  };
  

  return (
    <div className="mt-4">
      <h2>Available Products</h2>
      {responseMessage && <div className="alert alert-info">{responseMessage}</div>} 
      
      <div className="row">
        {products.map((product) => (
          <div className="col-12 col-md-4 mb-4" key={product.productId}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{product.nome}</h5>
                <p className="card-text">{product.descricao}</p>
                <p className="card-text"><strong>Price:</strong> R$ {product.preco}</p>
                <p className="card-text"><strong>Stock:</strong> {product.estoque}</p>

                <div className="form-group">
                  <label htmlFor={`quantity-${product.productId}`}>Quantity:</label>
                  <input
                    type="number"
                    id={`quantity-${product.productId}`}
                    className="form-control"
                    min="1"
                    max={product.estoque}
                    value={quantity[product.productId] || 0}
                    onChange={(e) => handleQuantityChange(product.productId, parseInt(e.target.value) || 1)}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(product.productId, quantity[product.productId] || 0)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemPage;
