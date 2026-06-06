import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMyProfile } from "../features/profile/hooks/useMyProfile";
import { useSaveProfile } from "../features/profile/hooks/useSaveProfile";
import { useUploadAvatar } from "../features/profile/hooks/useUploadAvatar";
import Navbar from "../shared/components/Navbar";
import { useAuth } from "../shared/context/AuthContext";

function ProfileSetupPage({ mode = "setup" }) {
  const { refreshAuth, currentUser, profileCompleted } = useAuth();
  const navigate = useNavigate();
  const isEditing = mode === "edit";

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
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { data, isLoading } = useMyProfile({
    enabled: isEditing && profileCompleted,
  });

  useEffect(() => {
    if (isEditing && !profileCompleted) {
      navigate("/profile/setup", { replace: true });
    }

    if (!isEditing && profileCompleted) {
      navigate("/profile/edit", { replace: true });
    }
  }, [isEditing, navigate, profileCompleted]);

  useEffect(() => {
    if (isEditing && data) {
      setForm({
        displayName: data.displayName || "",
        gender: data.gender || "",
        graduationYear: data.graduationYear || "",
        budgetMin: data.budgetMin || "",
        budgetMax: data.budgetMax || "",
        moveInDate: data.moveInDate || "",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || null,
      });
    }
  }, [data, isEditing]);

  const saveMutation = useSaveProfile(isEditing);

  const avatarMutation = useUploadAvatar();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    setAvatarUploading(true);
    avatarMutation.mutate(file, {
      onError: (err) => setAvatarError(err.message),
      onSettled: () => setAvatarUploading(false),
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const profileData = {
      displayName: form.displayName,
      gender: form.gender,
      graduationYear: Number(form.graduationYear),
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      moveInDate: form.moveInDate,
      bio: form.bio,
    };
    saveMutation.mutate(profileData, {
      onSuccess: () => {
        refreshAuth(currentUser, true);
        navigate(isEditing ? `/profiles/${currentUser.id}` : "/browse");
      },
    });
  }

  const submitError =
    saveMutation.error?.message ||
    (saveMutation.isError ? "Failed to save profile." : "");
  const showProfileLoading = isEditing && isLoading;

  return (
    <>
      {isEditing && <Navbar />}
      <main
        className="page-shell"
        style={isEditing ? { paddingTop: "80px" } : undefined}
      >
        <section className="page-card">
          <p className="page-eyebrow">Profile</p>
          <h1>{isEditing ? "Edit Profile" : "Profile Setup"}</h1>

          {isEditing && (
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
          )}

          {showProfileLoading && <p>Loading profile...</p>}

          {!showProfileLoading && (
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
              {submitError && <p className="form-error">{submitError}</p>}
              <button className="btn-primary" type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? "Saving..."
                  : isEditing
                    ? "Update Profile"
                    : "Create Profile"}
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default ProfileSetupPage;
