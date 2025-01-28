import React, { useState, useEffect } from "react";
import axios from "axios";

// API endpoint for fetching products
const API_BASE_URL = "http://127.0.0.1:8000";

const Shop = ({ userName }) => {
    // State to hold the products, loading status, and error
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products when the component mounts
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // TASK 2.2: Use a GET request to fetch and display all product data.
                const response = await axios.get(`${API_BASE_URL}/products/`);
                setProducts(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="shop page-bg">
            <h1>Welcome, {userName ? userName : "User"}</h1>
            <h4>Shop the Latest COSC Collection</h4>
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
