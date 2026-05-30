import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, createProfile, updateProfile } from "../lib/api/profile";
import { useAuth } from "../shared/context/AuthContext";

function ProfileSetupPage() {
  const [form, setForm] = useState({
    displayName: "",
    gender: "",
    graduationYear: "",
    budgetMin: "",
    budgetMax: "",
    moveInDate: "",
    bio: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUser, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        if (res.success && res.data) {
          setForm({
            displayName: res.data.displayName || "",
            gender: res.data.gender || "",
            graduationYear: res.data.graduationYear || "",
            budgetMin: res.data.budgetMin || "",
            budgetMax: res.data.budgetMax || "",
            moveInDate: res.data.moveInDate || "",
            bio: res.data.bio || "",
          });
          setIsEditing(true);
        }
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = {
        ...form,
        graduationYear: Number(form.graduationYear),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
      };
      const res = isEditing
        ? await updateProfile(data)
        : await createProfile(data);
      if (res.success) {
        refreshUser(currentUser, true);
        navigate("/browse");
      } else {
        setError(res.error.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    padding: "0.6rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  };

  const labelStyle = { fontWeight: "500" };

  return (
    <main className="page-shell">
      <section className="page-card">
        <p style={{ color: "#1e3a5f", fontWeight: "600", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Profile
        </p>
        <h1 style={{ marginBottom: "1.5rem" }}>
          {isEditing ? "Edit Profile" : "Profile Setup"}
        </h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Display Name</label>
            <input name="displayName" value={form.displayName} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} required style={inputStyle}>
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Graduation Year</label>
            <input name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Budget Min</label>
            <input name="budgetMin" type="number" value={form.budgetMin} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Budget Max</label>
            <input name="budgetMax" type="number" value={form.budgetMax} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Move-in Date</label>
            <input name="moveInDate" type="date" value={form.moveInDate} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          {error && <p style={{ color: "#e53e3e", margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "0.5rem", padding: "0.7rem", borderRadius: "6px", border: "none", background: "#1e3a5f", color: "white", fontSize: "1rem", cursor: "pointer" }}
          >
            {loading ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ProfileSetupPage;