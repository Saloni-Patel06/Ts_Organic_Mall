import { useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
import { useToast } from "../Context/ToastContext";
import { apiFetch } from "../utils/apiFetch";

const Support = () => {

    const { showToast } = useToast();
    const [form, setForm] = useState({
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.subject || !form.message) {
            showToast("All fields required", "error");
            return;
        }

        try {
            const response = await apiFetch("/supports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                // showToast("Profile Updated Successfully ✅", "success");
                showToast("Request submitted successfully ✅", "success");
                setForm({ email: "", subject: "", message: "" });
            } else {
                showToast("Failed to submit request", "error");
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("Server error", "error");
        }
    };

    const styles = {
        page: {

            minHeight: "115vh",
            background: "#f4f6f9",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20
        },
        card: {
            background: "#fff",
            padding: 30,
            borderRadius: 12,
            width: "100%",
            maxWidth: 600,
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
        },
        title: {
            marginBottom: 20,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 600
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: 15
        },
        input: {
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
            outline: "none"
        },
        textarea: {
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
            outline: "none",
            resize: "none"
        },
        button: {
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "#3CB815",
            color: "#fff",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer"
        }
    };

    return (
        <div
            className="container-fluid bg-light py-3"
            style={{ minHeight: "100vh", width: "100%", margin: 0 }}
        >


            <div style={styles.page}>

                {/*<Toaster position="top-right" />/  */}
                <div style={styles.card}>
                    <h2 style={styles.title}>Help Center</h2>

                    <form onSubmit={handleSubmit} style={styles.form}>


                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <input
                            style={styles.input}
                            type="text"
                            name="subject"
                            placeholder="Issue Subject"
                            value={form.subject}
                            onChange={handleChange}
                        />

                        <textarea
                            style={styles.textarea}
                            name="message"
                            placeholder="Describe your issue..."
                            rows="5"
                            value={form.message}
                            onChange={handleChange}
                        />

                        <button style={styles.button} type="submit">
                            Submit Request
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Support;