from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import List

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./shop.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI instance
app = FastAPI()

# CORS configuration (optional, remove if not needed)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database model
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    imageUrl = Column(String)
    price = Column(String)

Base.metadata.create_all(bind=engine)

# Pydantic models
# TASK 3.1: Create a model ProductBase with the fields 
# "title," "description," "imageUrl," and "price," all of which are of type str.
# Example:
# class ItemBase(BaseModel):
#     title: str
#     description: str
# Pydantic model
class ProductBase(BaseModel):
    title: str
    description: str
    imageUrl: str
    price: str





# TASK 3.2.1: Use the ProductBase model to define the type for the product parameter in the create API endpoint.
#Example: def create_item(item: ItemBase):
# Create Product 
@app.post("/products/")
def create_product(product: ProductBase):
    db = SessionLocal()
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    db.close()
    return db_product

# TASK 2.1: Add functionality to this endpoint to return all products.
# Hint: Use db.query(YOUR_MODEL_NAME).all() to retrieve all products from the database.
# Read all Products
@app.get("/products/")
def read_products():
    db = SessionLocal()
    products = db.query(Product).all()
    db.close()
    return products

# Read Product by ID
@app.get("/products/{product_id}")
def read_product(product_id: int):
    db = SessionLocal()
    product = db.query(Product).filter(Product.id == product_id).first()
    db.close()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# TASK 3.2.2: Use the ProductBase model to define the type for the product parameter in the update API endpoint.
# Update Product
@app.put("/products/{product_id}")
def update_product(product_id: int, product: ProductBase):
    db = SessionLocal()
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    db.close()
    return db_product


# TASK 4.1: Add delete product functionality to this API endpoint.
# Procedure:
# 1. Retrieve the product from the database using the product_id parameter, similar to the update API endpoint above.
# 2. Check if the product exists in the database. If it does not exist, return an error.
# 3. Delete the product from the database using db.delete(db_product).
# 4. Commit the changes to the database using db.commit().
# 5. Close the database connection using db.close().
# 6. Return db_product as confirmation.
# Delete Product
@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    db = SessionLocal()  
    db_product = db.query(Product).filter(Product.id == product_id).first()  
    if db_product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    db.close()
    return db_product

    

# Root endpoint for testing
@app.get("/")
def read_root():
    return {"message": "Welcome to the Product API"}
