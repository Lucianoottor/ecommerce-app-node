import React, { useState, useEffect } from 'react';

interface Supplier {
  supplierId: number;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
}

const SupplierPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newSupplier, setNewSupplier] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
  });
  const [responseMessage, setResponseMessage] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8080/supplier')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSuppliers(data);  // If the response is already an array, set it directly
        } else if (data.suppliers && Array.isArray(data.suppliers)) {
          setSuppliers(data.suppliers);  // If it's nested under "suppliers", set that
        } else {
          console.error('Suppliers data is not in the expected format');
          setSuppliers([]); // Set empty array if data is not as expected
        }
      })
      .catch((error) => {
        console.error('Error fetching suppliers:', error);
        setSuppliers([]); // Set empty array in case of error
      });
  }, []);

  // Handle input changes for the new supplier form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new supplier
  const handleAddSupplier = async () => {
    const { nome, cnpj, endereco, telefone } = newSupplier;
    if (!nome || !cnpj || !endereco || !telefone) {
      setResponseMessage('Please fill out all fields with valid values.');
      return;
    }

    const api_body = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, cnpj, endereco, telefone }),
    };

    try {
      const response = await fetch('http://localhost:8080/supplier', api_body);
      if (response.ok) {
        const data = await response.json();
        setResponseMessage('Supplier added successfully!');
        setNewSupplier({
          nome: '',
          cnpj: '',
          endereco: '',
          telefone: '',
        });

        // Fetch updated supplier list
        const updatedSuppliers = await fetch('http://localhost:8080/supplier').then((res) => res.json());
        setSuppliers(updatedSuppliers);
      } else {
        const error = await response.json();
        setResponseMessage(error?.message || 'Failed to add supplier.');
      }
    } catch (error) {
      setResponseMessage('Failed to connect to the server.');
      console.error(error);
    }
  };

  // Handle inline editing of supplier fields
  const handleEditSupplier = (supplierId: number, field: string, value: string) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.supplierId === supplierId
          ? { ...supplier, [field]: value } // Update the specific field for the supplier
          : supplier
      )
    );
  };

  // Handle saving the edited supplier
  const handleSaveSupplier = async (supplierId: number) => {
    const supplierToSave = suppliers.find((supplier) => supplier.supplierId === supplierId);
    if (!supplierToSave) return;

    const api_body = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplierToSave),
    };

    try {
      const response = await fetch(`http://localhost:8080/supplier/${supplierId}`, api_body);
      if (response.ok) {
        setResponseMessage('Supplier updated successfully!');
      } else {
        const error = await response.json();
        setResponseMessage(error?.message || 'Failed to update supplier.');
      }
    } catch (error) {
      setResponseMessage('Failed to connect to the server.');
      console.error(error);
    }
  };

  // Handle deleting a supplier
  const handleDeleteSupplier = async (supplierId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this supplier?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/supplier/${supplierId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuppliers(suppliers.filter((supplier) => supplier.supplierId !== supplierId));
        setResponseMessage('Supplier deleted successfully!');
      } else {
        setResponseMessage('Failed to delete supplier.');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setResponseMessage('Failed to delete supplier.');
    }
  };

  return (
    <div className="mt-4">
      <h2>Manage Suppliers</h2>
      {responseMessage && <div className="alert alert-info">{responseMessage}</div>} {/* Display feedback message */}

      {/* Add Supplier Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h3>Add New Supplier</h3>
          <div className="form-group">
            <label htmlFor="nome">Name:</label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="form-control"
              value={newSupplier.nome}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cnpj">CNPJ:</label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              className="form-control"
              value={newSupplier.cnpj}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              className="form-control"
              value={newSupplier.endereco}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Phone:</label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              className="form-control"
              value={newSupplier.telefone}
              onChange={handleInputChange}
            />
          </div>
          <button className="btn btn-success" onClick={handleAddSupplier}>
            Add Supplier
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.supplierId}>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleEditSupplier(supplier.supplierId, 'nome', e.target.textContent || supplier.nome)}
              >
                {supplier.nome}
              </td>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleEditSupplier(supplier.supplierId, 'cnpj', e.target.textContent || supplier.cnpj)}
              >
                {supplier.cnpj}
              </td>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleEditSupplier(supplier.supplierId, 'endereco', e.target.textContent || supplier.endereco)}
              >
                {supplier.endereco}
              </td>
              <td
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleEditSupplier(supplier.supplierId, 'telefone', e.target.textContent || supplier.telefone)}
              >
                {supplier.telefone}
              </td>
              

              <td>
                {/* Save Button */}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSaveSupplier(supplier.supplierId)}
                >
                  Save
                </button>
                {/* Delete Button */}
                <button
                  className="btn btn-danger btn-sm ml-2"
                  onClick={() => handleDeleteSupplier(supplier.supplierId)}
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

export default SupplierPage;
