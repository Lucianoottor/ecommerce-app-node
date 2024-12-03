import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import UserAccountForm from './UserAccountForm';
import UserLoginForm from './UserLoginForm';
import ItemPage from './ItemPage'; 
import CartPage from './CartPage'; 
import ProductPage from './ProductPage';
import SupplierPage from './SupplierPage';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if the user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('products'); // Redirect to products page after login
    }
  }, []);

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('products');
  };

  return (
    <div className="App">
      {/* Bootstrap Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">Landing Page</a>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ml-auto">
            {!isAuthenticated && (
            <li className="nav-item">
              <button
                className="nav-link btn"
                onClick={() => handleNavClick('createAccount')}
              >
                Criar conta
              </button>
            </li>
            )}
            {!isAuthenticated && (
            <li className="nav-item">
              <button
                className="nav-link btn"
                onClick={() => handleNavClick('login')}
              >
                Login
              </button>
            </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="nav-link btn"
                  onClick={() => handleNavClick('products')}
                >
                  Products
                </button>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="nav-link btn"
                  onClick={() => handleNavClick('cart')}
                >
                  Cart
                </button>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="nav-link btn"
                  onClick={() => handleNavClick('product_manager')}
                >
                  Admin
                </button>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="nav-link btn"
                  onClick={() => handleNavClick('supplier')}
                >
                  Supplier
                </button>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <button
                  className="nav-link btn"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </li>
            )}
            
            
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container text-center mt-5">
        {currentPage === 'landing' && (
          <div>
            <h1 className="display-4">Segundo Bimestre</h1>
            <p>Welcome to our app. Please create an account or log in to get started.</p>
          </div>
        )}

        {currentPage === 'createAccount' && (
          <div className="mt-4">
            <UserAccountForm />
          </div>
        )}

        {currentPage === 'login' && (
          <div className="mt-4">
            <UserLoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        )}

        {currentPage === 'products' && isAuthenticated && (
          <div className="mt-4">
            <ItemPage />
          </div>
        )}
        {currentPage === 'cart' && isAuthenticated && (
          <div className="mt-4">
            <CartPage />
          </div>
        )}
        {currentPage === 'product_manager' && isAuthenticated && (
          <div className="mt-4">
            <ProductPage />
          </div>
        )}
        {currentPage === 'supplier' && isAuthenticated && (
          <div className="mt-4">
            <SupplierPage />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
