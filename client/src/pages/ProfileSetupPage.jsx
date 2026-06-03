import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  createProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../lib/api/profile";
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
    avatarUrl: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
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
            avatarUrl: res.data.avatarUrl || null,
          });
          setIsEditing(true);
        }
      })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");
    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await uploadMyAvatar(formData);
      if (res.success && res.data) {
        setForm({ ...form, avatarUrl: res.data.avatarUrl });
      } else {
        setAvatarError(res.error?.message ?? "Upload failed.");
      }
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = {
        displayName: form.displayName,
        gender: form.gender,
        graduationYear: Number(form.graduationYear),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        moveInDate: form.moveInDate,
        bio: form.bio,
      };
      const res = isEditing
        ? await updateMyProfile(data)
        : await createProfile(data);
      if (res.success) {
        refreshAuth(currentUser, true);
        navigate("/browse");
      } else {
        setError(res.error?.message ?? "Failed to save profile.");
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

        <div className="avatar-section">
          {form.avatarUrl && (
            <img
              src={form.avatarUrl}
              alt="Avatar preview"
              className="avatar-preview"
            />
          )}
          <div className="avatar-upload">
            <label htmlFor="avatar-input" className="btn-secondary">
              {avatarUploading ? "Uploading..." : "Upload Photo"}
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
              hidden
            />
          </div>
          {avatarError && <p className="form-error">{avatarError}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Display Name</label>
            <input
              className="form-input"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Gender</label>
            <select
              className="form-input"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-field">
            <label>Graduation Year</label>
            <input
              className="form-input"
              name="graduationYear"
              type="number"
              value={form.graduationYear}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Budget Min</label>
            <input
              className="form-input"
              name="budgetMin"
              type="number"
              value={form.budgetMin}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Budget Max</label>
            <input
              className="form-input"
              name="budgetMax"
              type="number"
              value={form.budgetMax}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Move-in Date</label>
            <input
              className="form-input"
              name="moveInDate"
              type="date"
              value={form.moveInDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Bio</label>
            <textarea
              className="form-input"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Profile"
                : "Create Profile"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ProfileSetupPage;
