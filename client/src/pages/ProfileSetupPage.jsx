import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, createProfile, updateMyProfile } from "../lib/api/profile";
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
  const { refreshAuth, currentUser } = useAuth();
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
        ? await updateMyProfile(data)
        : await createProfile(data);
      if (res.success) {
        refreshAuth(currentUser, true);
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

  return (
    <main className="page-shell">
      <section className="page-card">
        <p className="page-eyebrow">Profile</p>
        <h1>{isEditing ? "Edit Profile" : "Profile Setup"}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Display Name</label>
            <input className="form-input" name="displayName" value={form.displayName} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Gender</label>
            <select className="form-input" name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-field">
            <label>Graduation Year</label>
            <input className="form-input" name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Budget Min</label>
            <input className="form-input" name="budgetMin" type="number" value={form.budgetMin} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Budget Max</label>
            <input className="form-input" name="budgetMax" type="number" value={form.budgetMax} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Move-in Date</label>
            <input className="form-input" name="moveInDate" type="date" value={form.moveInDate} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Bio</label>
            <textarea className="form-input" name="bio" value={form.bio} onChange={handleChange} rows={4} style={{ resize: "vertical" }} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ProfileSetupPage;
