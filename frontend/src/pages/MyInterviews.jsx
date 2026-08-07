import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/api";

function MyInterviews() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      const response = await api.get("/interviews/my");
      setSessions(response.data);
    } catch (err) {
      setError("Failed to fetch interview sessions");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const getStatusClass = (status) => {
    return status === "completed" ? "status-pill active" : "status-pill pending";
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-header">
          <p className="eyebrow dark-eyebrow">Mock Interview</p>
          <h1>My Interview Sessions</h1>
          <p>
            Continue pending interviews or review your completed interview
            results.
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        {sessions.length === 0 && (
          <div className="result-card">
            <h2>No interviews yet</h2>
            <p>
              Go to <strong>My Analyses</strong> and start a mock interview from
              any resume-JD analysis.
            </p>
            <Link className="primary-link-btn dark-btn" to="/candidate/my-analyses">
              View My Analyses
            </Link>
          </div>
        )}

        <div className="analysis-list">
          {sessions.map((session) => (
            <div className="analysis-card" key={session.id}>
              <div className="analysis-header">
                <div>
                  <h2>{session.title}</h2>
                  <p>
                    Questions: {session.answered_questions}/
                    {session.total_questions}
                  </p>
                </div>

                <div className="score-badge">{session.average_score}%</div>
              </div>

              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusClass(session.status)}>
                  {session.status}
                </span>
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width:
                      session.total_questions > 0
                        ? `${
                            (session.answered_questions /
                              session.total_questions) *
                            100
                          }%`
                        : "0%",
                  }}
                />
              </div>

              <div className="button-row">
                {session.status === "completed" ? (
                  <Link
                    className="secondary-link-btn dark-outline-btn"
                    to={`/candidate/interviews/${session.id}/result`}
                  >
                    View Result
                  </Link>
                ) : (
                  <Link
                    className="primary-link-btn dark-btn"
                    to={`/candidate/interviews/${session.id}`}
                  >
                    Continue Interview
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default MyInterviews;