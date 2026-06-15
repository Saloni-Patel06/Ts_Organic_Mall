import React, { useState, useEffect } from "react";
import CommonTable from "./../components/CommonTable";
import { apiFetch } from "../utils/apiFetch";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // const response = await fetch("http://localhost:5000/manage-products");
      const response = await apiFetch("/manage-products", {
        method: "GET",
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const [modal, setModal] = useState({ open: false, type: "", product: null });
  const [previewImg, setPreviewImg] = useState("");
  const [error, setError] = useState(""); // for modal validation

  const openModal = (type, product = null) => {
    setModal({ open: true, type, product });
    setPreviewImg(product?.img || "");
    setError(""); // clear previous error
  };
  const closeModal = () => {
    setModal({ open: false, type: "", product: null });
    setPreviewImg("");
    setError("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const price = parseInt(form.price.value);
    const stock = parseInt(form.stock.value);

    if (price < 0) return setError("Price cannot be negative");
    if (stock < 0) return setError("Stock cannot be negative");

    const productData = {
      name: form.name.value,
      category: form.category.value,
      price,
      stock,
      unit: form.unit.value || "",
      img: previewImg || "/img/default.png",
    };

    try {
      if (modal.type === "add") {
        await apiFetch("/manage-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        await apiFetch(`/manage-products/${modal.product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
      setError("Failed to save product");
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiFetch(`/manage-products/${productId}`, {
          method: "DELETE",
        });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleDeleteSelected = async (rows) => {
    for (const row of rows) {
      await apiFetch(`/manage-products/${row.id}`, { method: "DELETE" });
    }
    fetchProducts();
  };

  const columns = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "img",
      header: "Image",
      Cell: ({ row }) => (
        <img
          src={row.original.img}
          alt={row.original.name}
          style={{ width: "50px", height: "50px", objectFit: "cover" }}
        />
      ),
    },
    { accessorKey: "name", header: "Product Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "unit", header: "Unit" },
    { accessorKey: "price", header: "Price (Rs.)" },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "actions",
      header: "Actions",
      Cell: ({ row }) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={() => openModal("edit", row.original)}>Update</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.original.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid mt-5 pt-5"><br />
      <div className="card shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="card-header d-flex justify-content-between" style={{
          backgroundColor: "#CCFFCC", borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px"
        }}>
          <h4 className="mb-0" style={{ color: "#5e4212" }}><b>Manage Products</b></h4>
          <button className="btn btn-primary btn-sm" style={{ border: "2px solid #846328" }} onClick={() => openModal("add")}>
            Add Product
          </button>
        </div>
        <div className="card-body p-0">
          <CommonTable columns={columns} data={products} onDeleteSelected={handleDeleteSelected} />
        </div>
      </div>

      {modal.open && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" style={{ maxHeight: "90vh" }}>
            <div className="modal-content" style={{ overflowY: "auto", maxHeight: "90vh" }}>
              <div className="modal-header">
                <h5 className="modal-title">{modal.type === "add" ? "Add Product" : "Update Product"}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Product Name</label>
                    <input type="text" name="name" className="form-control" defaultValue={modal.product?.name || ""} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Category</label>
                    <input type="text" name="category" className="form-control" defaultValue={modal.product?.category || ""} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Price</label>
                    <input type="number" name="price" min="0" className="form-control" defaultValue={modal.product?.price || ""} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Stock</label>
                    <input type="number" name="stock" min="0" className="form-control" defaultValue={modal.product?.stock || ""} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Unit</label>
                    <input type="text" name="unit" className="form-control" placeholder="e.g. 500gm, 1kg" defaultValue={modal.product?.unit || ""} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Upload Image</label>
                    <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} />
                    {previewImg && <img src={previewImg} alt="preview" className="mt-2" style={{ width: "100px" }} />}
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{modal.type === "add" ? "Add Product" : "Update Product"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;