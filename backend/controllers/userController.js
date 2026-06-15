const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const getUsers = async (req, res, next) => {
  try {
    const db = getDB();
    const { role, email } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (email) filter.email = email;

    const users = await db.collection("users").find(filter).toArray();

      const formatted = users.map(u => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      address: u.address,
      pincode: u.pincode,
      city: u.city,
      state: u.state,
      role: u.role,
      vehicleNumber: u.vehicleNumber || "",
      status: u.status || "Active",
      lastActive: u.lastActive ? u.lastActive.toISOString() : null
    }));

    res.json(formatted);

  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const db = getDB();
    let query = ObjectId.isValid(req.params.id)
      ? { _id: new ObjectId(req.params.id) }
      : { email: req.params.id };

    const user = await db.collection("users").findOne(query);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      mobile: user.mobile || user.mobile,
      address: user.address,
      pincode: user.pincode,
      city: user.city,
      state: user.state,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    next(error);
  }
};


const updateUser = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const db = getDB();

    const updateFields = {
      name: req.body.name,
      email: req.body.email,

      mobile: req.body.mobile || req.body.mobile,
      address: req.body.address,
      pincode: req.body.pincode,
      city: req.body.city,
      state: req.body.state,
      status: req.body.status,
      updatedAt: new Date()
    };

    Object.keys(updateFields).forEach(
      key => updateFields[key] === undefined && delete updateFields[key]
    );

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });

  } catch (error) {
    next(error);
  }
};
const deleteUser = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const db = getDB();
    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    // ===== ADMIN STATIC LOGIN =====
    if (email === "admin@gmail.com" && password === "admin123") {
      return res.json({
        userId: "admin-1",
        name: "Admin",
        email: "admin@gmail.com",
        role: "admin",
        mobile: "",
        address: "",
        pincode: "",
        city: "Anand",
        state: "Gujarat"
      });
    }

    // ===== DATABASE USER LOGIN =====
    const user = await db.collection("users").findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "Blocked") {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    res.json({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      mobile: user.mobile || user.mobile,
      address: user.address,
      pincode: user.pincode,
      city: user.city,
      state: user.state,
      role: user.role
    });

  } catch (error) {
    next(error);
  }
};
const getAgents = async (req, res, next) => {
  try {
    const db = getDB();

    const agents = await db.collection("users")
      .find({ role: "agent" })
      .toArray();

    const formatted = agents.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      address: u.address,
      pincode: u.pincode,
      role: u.role,
      status: u.status,
      vehicleNumber: u.vehicleNumber || ""   // ✅ correct
    }));

    res.json(formatted);

  } catch (error) {
    next(error);
  }
};


module.exports = {
  getUsers,
  getAgents,
  getUserById,
  updateUser,
  deleteUser,
  loginUser
};