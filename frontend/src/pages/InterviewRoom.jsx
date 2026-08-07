import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/api";

function InterviewRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSession = async () => {
    try {
      const response = await api.get(`/interviews/${sessionId}`);
      setSessionData(response.data);
    } catch (err) {
      setError("Failed to load interview session");
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const answeredQuestionSet = useMemo(() => {
    if (!sessionData) return new Set();

    return new Set(sessionData.answers.map((item) => item.question));
  }, [sessionData]);

  const currentQuestion = useMemo(() => {
    if (!sessionData) return null;

    return sessionData.questions.find(
      (question) => !answeredQuestionSet.has(question)
    );
  }, [sessionData, answeredQuestionSet]);

  const submitAnswer = async (e) => {
    e.preventDefault();

    if (!currentQuestion) {
      navigate(`/candidate/interviews/${sessionId}/result`);
      return;
    }

    setError("");
    setLatestFeedback(null);
    setSubmitting(true);

    try {
      const response = await api.post(`/interviews/${sessionId}/answer`, {
        question: currentQuestion,
        answer,
      });

      setLatestFeedback(response.data);
      setAnswer("");

      await fetchSession();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionData) {
    return (
      <>
        <Navbar />
        <main className="container">
          <p>Loading interview...</p>
          {error && <div className="error-box">{error}</div>}
        </main>
      </>
    );
  }

  const session = sessionData.session;
  const progressText = `${session.answered_questions}/${session.total_questions}`;

  if (!currentQuestion || session.status === "completed") {
    return (
      <>
        <Navbar />

        <main className="container">
          <div className="result-card">
            <h1>Interview Completed</h1>
            <p>
              You answered {session.answered_questions} out of{" "}
              {session.total_questions} questions.
            </p>
            <p>
              <strong>Average Score:</strong> {session.average_score}%
            </p>

            <Link
              className="primary-link-btn dark-btn"
              to={`/candidate/interviews/${sessionId}/result`}
            >
              View Final Result
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="interview-layout">
          <section className="interview-main">
            <div className="page-header">
              <p className="eyebrow dark-eyebrow">AI Mock Interview</p>
              <h1>{session.title}</h1>
              <p>
                Answer the question clearly. Use definition, explanation, and
                project example.
              </p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="question-card">
              <div className="question-top">
                <span>Question {session.answered_questions + 1}</span>
                <strong>{progressText}</strong>
              </div>

              <h2>{currentQuestion}</h2>
            </div>

            <form className="analysis-form" onSubmit={submitAnswer}>
              <label>Your Answer</label>
              <textarea
                placeholder="Type your answer here. Try to explain with example..."
                rows="9"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />

              <button
                type="submit"
                className="primary-btn"
                disabled={submitting}
              >
                {submitting ? "Evaluating..." : "Submit Answer"}
              </button>
            </form>

            {latestFeedback && (
              <div className="feedback-card">
                <div className="analysis-header">
                  <div>
                    <h2>AI Feedback</h2>
                    <p>Feedback for your latest answer</p>
                  </div>

                  <div className="score-badge">{latestFeedback.score}%</div>
                </div>
                <div className="score-grid">
                    <div>
                        <span>Technical</span>
                        <strong>{latestFeedback.technical_score}%</strong>
                    </div>

                    <div>
                        <span>Communication</span>
                        <strong>{latestFeedback.communication_score}%</strong>
                    </div>

                    <div>
                        <span>Confidence</span>
                        <strong>{latestFeedback.confidence_score}%</strong>
                    </div>
                </div>

                <p>
                  <strong>Feedback:</strong> {latestFeedback.feedback}
                </p>
                <p>
                    <strong>Strengths:</strong> {latestFeedback.strengths}
                </p>
                <p>
                    <strong>Weaknesses:</strong> {latestFeedback.weaknesses}
                </p>


                <p>
                  <strong>Improvement Tip:</strong>{" "}
                  {latestFeedback.improvement_tip}
                </p>
              </div>
            )}
          </section>

          <aside className="interview-side">
            <div className="result-card">
              <h3>Progress</h3>
              <p>
                Answered {session.answered_questions} of{" "}
                {session.total_questions}
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      (session.answered_questions / session.total_questions) *
                      100
                    }%`,
                  }}
                />
              </div>

              <p>
                <strong>Average Score:</strong> {session.average_score}%
              </p>

              <Link
                className="secondary-link-btn dark-outline-btn"
                to="/candidate/interviews"
              >
                Back to Interviews
              </Link>
            </div>

            <div className="result-card">
              <h3>Answered Questions</h3>

              {sessionData.answers.length === 0 ? (
                <p>No answers submitted yet.</p>
              ) : (
                <ul className="mini-list">
                  {sessionData.answers.map((item) => (
                    <li key={item.id}>
                      <strong>{item.score}%</strong> — {item.question}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

export default InterviewRoom;