import React, { useState, useEffect } from "react";
import { useToast } from "../Context/ToastContext";
import { apiFetch } from "../utils/apiFetch";

const AgentProfile = () => {
  const { showToast } = useToast();

  const [isEdit, setIsEdit] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    pincode: "",
    city: "",
    state: "",
    vehicle: "",
  });

  useEffect(() => {

    const fetchAgentData = async () => {

      const email = localStorage.getItem("email");

      if (!email) return;

      try {

        // const response = await fetch(`http://localhost:5000/users?email=${email}`);
        const response = await apiFetch(`/users?role=agent&email=${email}`, {
          method: "GET",
        });

        const data = await response.json();

        if (data.length > 0) {

          const userData = data[0];

          setProfile({
            _id: userData._id,
            name: userData.name || "",
            email: userData.email || "",
            mobile: userData.mobile || "",
            pincode: userData.pincode || "",
            city: userData.city || "Anand",
            state: userData.state || "Gujarat",
            vehicle: userData.vehicleNumber || "",

          });

        }

      } catch (error) {

        console.error("Error fetching agent data:", error);

      }

    };

    fetchAgentData();

  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    if (name === "pincode" && value.length === 6) {
      try {
        const res = await apiFetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          const post = data[0].PostOffice[0];
          setProfile(prev => ({
            ...prev,
            city: post.District,
            state: post.State
          }));
        }
      } catch (err) {
        console.log("Pincode fetch failed");
      }
    }
  };


  const handleSave = async () => {

    try {

      await apiFetch(`/users/${profile.id}`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          mobile: profile.mobile,
          pincode: profile.pincode,
          city: profile.city,
          state: profile.state,
          vehicleNumber: profile.vehicle

        })

      });

      setIsEdit(false);

      showToast("Profile Updated Successfully ✅", "success");

    } catch (error) {

      console.error("Update failed:", error);

    }

  };

  const handleCancel = () => setIsEdit(false);

  return (
    <div
      className="container-fluid bg-light py-3"
      style={{ minHeight: "100vh", width: "100%", margin: 0, marginTop: "120px" }}
    >
      {/* <br /><br /><br /><br /><br /> */}
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">

          <div className="card shadow border-0 rounded-4 profile-card">

            {/* ===== HEADER===== */}
            <div className="card-header bg-primary text-center rounded-top-4 py-3">
              <h5 className="mb-0 text-white fw-bold">
                Delivery Agent Profile
              </h5>
            </div>

            {/* ===== BODY ===== */}
            <div className="card-body p-3">

              <div className="row g-2">

                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Mobile
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="mobile"
                    value={profile.mobile}
                    onChange={handleChange}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Pincode
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    disabled={!isEdit}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">
                    City
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile.city}
                    disabled
                  />
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold">
                    State
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile.state}
                    disabled
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="vehicle"
                    value={profile.vehicle}
                    onChange={handleChange}
                    disabled={!isEdit}
                  />
                </div>


              </div>

              {/* ===== BUTTONS ===== */}
              <div className="text-center mt-3">

                {!isEdit ? (
                  <button
                    className="btn btn-primary btn-sm px-4"
                    onClick={() => setIsEdit(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-primary btn-sm px-3 me-2"
                      onClick={handleSave}
                    >
                      Save
                    </button>

                    <button
                      className="btn btn-outline-secondary btn-sm px-3"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </>
                )}

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ===== CSS ===== */}
      <style>{`
        .profile-card{
          transition:0.25s;
        }
        .profile-card:hover{
          transform:translateY(-4px);
        }
        .form-control-sm{
          border-radius:10px;
        }
      `}</style>

    </div>
  );
};

export default AgentProfile;