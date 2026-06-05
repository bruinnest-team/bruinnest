import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyQuestionnaire, upsertMyQuestionnaire } from "../lib/api/questionnaire";
import Navbar from "../shared/components/Navbar";

const QUESTIONS = [
  {
    field: "sleepSchedule",
    label: "Sleep Schedule",
    options: [
      { value: "early_bird", label: "Early Bird (asleep before 11pm)" },
      { value: "flexible", label: "Flexible" },
      { value: "night_owl", label: "Night Owl (up past midnight)" },
    ],
  },
  {
    field: "cleanlinessLevel",
    label: "Cleanliness Level",
    options: [
      { value: "very_clean", label: "Very Clean — I clean regularly" },
      { value: "clean", label: "Clean — tidy most of the time" },
      { value: "moderate", label: "Moderate — clean when needed" },
      { value: "relaxed", label: "Relaxed — comfortable with some mess" },
    ],
  },
  {
    field: "noiseTolerance",
    label: "Noise Tolerance",
    options: [
      { value: "low", label: "Low — I prefer quiet" },
      { value: "medium", label: "Medium — some noise is fine" },
      { value: "high", label: "High — noise doesn't bother me" },
    ],
  },
  {
    field: "guestPolicy",
    label: "Guest Policy",
    options: [
      { value: "no_guests", label: "No guests" },
      { value: "occasionally_ok", label: "Occasional guests are fine" },
      { value: "often_ok", label: "Guests over often is fine" },
    ],
  },
  {
    field: "studyHabits",
    label: "Study Habits",
    options: [
      { value: "quiet_at_home", label: "I study at home and need quiet" },
      { value: "flexible", label: "Flexible — home or library" },
      { value: "library_preferred", label: "I mostly study at the library" },
    ],
  },
  {
    field: "smokingPreference",
    label: "Smoking Preference",
    options: [
      { value: "non_smoker_only", label: "Non-smokers only" },
      { value: "outside_ok", label: "Outside only is fine" },
      { value: "okay", label: "No preference" },
    ],
  },
  {
    field: "drinkingPreference",
    label: "Drinking Preference",
    options: [
      { value: "abstain", label: "I don't drink" },
      { value: "social_only", label: "Social drinking only" },
      { value: "okay", label: "No preference" },
    ],
  },
  {
    field: "sharingPreference",
    label: "Sharing Preference",
    options: [
      { value: "keep_separate", label: "Keep things separate" },
      { value: "flexible", label: "Flexible" },
      { value: "shared_supplies_ok", label: "Sharing supplies is fine" },
    ],
  },
  {
    field: "petComfort",
    label: "Pet Comfort",
    options: [
      { value: "no_pets", label: "No pets please" },
      { value: "okay_with_cats", label: "Cats are fine" },
      { value: "okay_with_dogs", label: "Dogs are fine" },
      { value: "okay_all", label: "All pets welcome" },
    ],
  },
  {
    field: "communicationStyle",
    label: "Communication Style",
    options: [
      { value: "minimal", label: "Minimal — text when needed" },
      { value: "casual", label: "Casual — friendly check-ins" },
      { value: "direct_and_frequent", label: "Direct and frequent" },
    ],
  },
];

const EMPTY_ANSWERS = Object.fromEntries(QUESTIONS.map((q) => [q.field, ""]));

function QuestionnairePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [validationError, setValidationError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["questionnaire"],
    queryFn: () => getMyQuestionnaire().then((res) => res.data),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setAnswers(data);
    }
  }, [data]);

  const upsertMutation = useMutation({
    mutationFn: (payload) => upsertMyQuestionnaire(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questionnaire"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setJustSaved(true);
    },
  });

  function handleChange(field, value) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");
    setJustSaved(false);

    const unanswered = QUESTIONS.filter((q) => !answers[q.field]);
    if (unanswered.length > 0) {
      setValidationError("Please answer all questions before submitting.");
      return;
    }

    upsertMutation.mutate(answers);
  }

  const errMsg =
    validationError || upsertMutation.error?.message || "";

  return (
    <>
      <Navbar />
      <main className="page-shell" style={{ paddingTop: "80px" }}>
        <section className="page-card">
          <p className="page-eyebrow">COMPATIBILITY</p>
          <h1>Roommate Questionnaire</h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Answer all 10 questions to get matched with compatible roommates.
            You can update your answers anytime.
          </p>

          {isLoading && <p>Loading...</p>}

          {!isLoading && (
            <form onSubmit={handleSubmit}>
              {QUESTIONS.map((q) => (
                <div className="form-field" key={q.field}>
                  <label>{q.label}</label>
                  <select
                    className="form-input"
                    value={answers[q.field]}
                    onChange={(e) => handleChange(q.field, e.target.value)}
                  >
                    <option value="">Select an answer...</option>
                    {q.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {errMsg && <p className="form-error">{errMsg}</p>}
              {justSaved && (
                <p style={{ color: "#16a34a", marginBottom: "1rem" }}>
                  Questionnaire saved! Compatibility scores have been updated.
                </p>
              )}

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={upsertMutation.isPending}
                >
                  {upsertMutation.isPending ? "Saving..." : "Save Answers"}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => navigate("/map")}
                >
                  Back to Map
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default QuestionnairePage;
