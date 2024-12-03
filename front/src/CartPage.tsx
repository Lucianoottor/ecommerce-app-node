import React, { useState, useEffect } from 'react';

interface Product {
  productId: number;
  nome: string;
  preco: string;
  estoque: number;
}

interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // State to store cart items
  const [responseMessage, setResponseMessage] = useState<string>(''); // Feedback message

  // Fetch cart items from the API
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setResponseMessage('You must be logged in to view your cart.');
      return;
    }

    // Fetch the cart items
    fetch('http://localhost:8080/cart/getItems', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => setCartItems(data))
      .catch((error) => {
        setResponseMessage('Failed to fetch cart items.');
        console.error(error);
      });
  }, []);

  const handleRemoveItem = async (productId: number) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setResponseMessage('You must be logged in to remove items.');
      return;
    }
  
    // Correctly format the URL with the productId
    const url = `http://localhost:8080/cart/remove/${productId}`;
  
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        // Remove the item from the state
        setCartItems((prevCartItems) => prevCartItems.filter(item => item.productId !== productId));
        setResponseMessage('Product removed from cart successfully!');
      } else {
        const error = await response.json();
        setResponseMessage(error?.message || 'Failed to remove product from cart.');
      }
    } catch (error) {
      setResponseMessage('Failed to connect to the server.');
      console.error(error);
    }
  };
  
  // Render cart items in a table
  return (
    <div className="mt-4">
      <h2>Your Cart</h2>
      {responseMessage && <div className="alert alert-info">{responseMessage}</div>}

      {cartItems.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((cartItem) => (
              <tr key={cartItem.cartItemId}>
                <td>{cartItem.product.nome}</td>
                <td>{cartItem.quantity}</td>
                <td>R$ {parseFloat(cartItem.product.preco) * cartItem.quantity}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveItem(cartItem.productId)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default CartPage;
