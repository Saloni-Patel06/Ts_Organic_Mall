import React, { useState, useEffect } from "react";
import { useToast } from "../Context/ToastContext";
import { apiFetch } from "../utils/apiFetch";

const PROFILE_FIELDS = [
  { name: "name", label: "Full Name", type: "text", editable: true },
  { name: "mobile", label: "Mobile", type: "tel", editable: true },
  { name: "email", label: "Email", type: "email", editable: true },
  { name: "address", label: "Address", type: "textarea", editable: true, rows: 2 },
  { name: "pincode", label: "Pincode", type: "text", editable: true },
  { name: "city", label: "City", type: "text", editable: true }
];

const Profile = () => {

  const { showToast } = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const [user, setUser] = useState(
    PROFILE_FIELDS.reduce((acc, field) => ({ ...acc, [field.name]: "" }), { role: "" })
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("userId");

      const localData = {
        name: localStorage.getItem("name") || "",
        mobile: localStorage.getItem("mobile") || "",
        email: localStorage.getItem("email") || "",
        address: localStorage.getItem("address") || "",
        pincode: localStorage.getItem("pincode") || "",
        city: localStorage.getItem("city") || "Anand"
      };

      setUser({
        ...localData,
        state: "Gujarat",
        role: localStorage.getItem("role") || ""
      });

      if (!userId) return;

      try {
        const response = await apiFetch(`/users/${userId}`, {
          method: "GET",
        });

        const data = await response.json();

        if (data) {
          const updatedUser = {
            name: data.name || localData.name,
            mobile: data.mobile || localData.mobile,
            email: data.email || localData.email,
            address: data.address || localData.address,
            pincode: data.pincode || localData.pincode,
            city: data.city || localData.city,
            state: "Gujarat",
            role: data.role || localStorage.getItem("role") || ""
          };

          setUser(updatedUser);

          ["name", "mobile", "address", "pincode", "city"].forEach(key => {
            localStorage.setItem(key, updatedUser[key]);
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);

      }


    }; fetchProfile();
  }, []);

  const handleChange = (name, value) => {
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");

    const updateData = {
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      address: user.address,
      pincode: user.pincode,
      city: user.city
    };
    try {
      await apiFetch(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updateData)
      });

      Object.keys(updateData).forEach(key =>
        localStorage.setItem(key, updateData[key])
      );

      setIsEdit(false);
      showToast("Profile Updated Successfully ✅", "success");

    } catch (error) {
      console.error("Save error:", error);
      showToast(error.message || "Failed to update profile", "error");
    }
  };

  return (
    <div className="container-fluid bg-light py-3" style={{ minHeight: "100vh", width: "100%", margin: 0, marginTop: "120px" }}>
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">

          <div className="card shadow border-0 rounded-4 profile-card">

            {/* ===== HEADER===== */}
            <div className="card-header bg-primary text-center rounded-top-4 py-3">
              <h5 className="mb-0 text-white fw-bold ">Customer Profile</h5>
            </div>

            <div className="card-body p-3">
              <div className="row g-2">
                {PROFILE_FIELDS.map(field => (
                  <div key={field.name} className="col-12">
                    <label className="form-label small fw-semibold">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        className="form-control form-control-sm"
                        name={field.name}
                        value={user[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        disabled={!isEdit || !field.editable}
                        rows={field.rows || 2}
                      />
                    ) : (
                      <input
                        type={field.type}
                        className="form-control form-control-sm"
                        name={field.name}
                        value={user[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        disabled={!isEdit || !field.editable}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mt-3">
                {!isEdit ? (
                  <button className="btn btn-primary btn-sm px-4" onClick={() => setIsEdit(true)}>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary btn-sm px-3 me-2" onClick={handleSave}>
                      Save
                    </button>
                    <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setIsEdit(false)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
