import { useParams } from "react-router-dom";

function ProfileDetailPage() {
  const { userId } = useParams();

  return (
    <main className="page-shell">
      <section className="page-card">
        <p className="page-eyebrow">Profile</p>
        <h1>Profile Detail</h1>
        <p>Public profile detail page placeholder for user `{userId}`.</p>
      </section>
    </main>
  );
}

export default ProfileDetailPage;
