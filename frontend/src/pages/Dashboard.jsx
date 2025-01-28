import React, { useState, useEffect } from "react";
import axios from "axios";

// Base URL for the API
const API_BASE_URL = "http://127.0.0.1:8000";

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [formProduct, setFormProduct] = useState({
        id: null,
        title: "",
        description: "",
        imageUrl: "",
        price: "",
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleChange = (e) => {
        setFormProduct({
            ...formProduct,
            [e.target.name]: e.target.value,
        });
    };

    const createOrUpdateProduct = async () => {
        try {
            if (formProduct.id) {
                // Update existing product
                await axios.put(
                    `${API_BASE_URL}/products/${formProduct.id}`,
                    formProduct
                );
            } else {
                // Create new product
                await axios.post(`${API_BASE_URL}/products`, formProduct);
            }
            fetchProducts();
            setFormProduct({
                id: null,
                title: "",
                description: "",
                imageUrl: "",
                price: "",
            });
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const startUpdate = (product) => {
        setFormProduct(product);
    };

    const deleteProduct = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/products/${id}`);
            // TASK 4.2: Re-fetch the data after the product is deleted
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    return (
        <div className="dashboard page-bg">
            <h1>Product Dashboard</h1>
            <h4>Manage the COSC Collection</h4>
            <div className="new-product-form island">
                <h5>
                    {formProduct.id ? "Update Product" : "Create New Product"}
                </h5>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formProduct.title}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={formProduct.description}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="imageUrl"
                    placeholder="Image URL"
                    value={formProduct.imageUrl}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="price"
                    placeholder="Price"
                    value={formProduct.price}
                    onChange={handleChange}
                />
                <button onClick={createOrUpdateProduct}>
                    {formProduct.id ? "Update Product" : "Add Product"}
                </button>
            </div>
            <div className="cards">
                {products.map((product) => (
                    <div key={product.id} className="card">
                        <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="card-image"
                        />
                        <h5 className="card-title">{product.title}</h5>
                        <p className="card-description">
                            {product.description}
                        </p>
                        <p className="card-price">{product.price}</p>
                        <div className="buttons-container">
                            <button onClick={() => startUpdate(product)}>
                                Update
                            </button>
                            <button onClick={() => deleteProduct(product.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
