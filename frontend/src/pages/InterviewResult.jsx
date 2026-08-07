import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/api";

function InterviewResult() {
  const { sessionId } = useParams();

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const fetchResult = async () => {
    try {
      const response = await api.get(`/interviews/${sessionId}/result`);
      setResult(response.data);
    } catch (err) {
      setError("Failed to fetch interview result");
    }
  };

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

  if (!result) {
    return (
      <>
        <Navbar />
        <main className="container">
          <p>Loading result...</p>
          {error && <div className="error-box">{error}</div>}
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-header">
          <p className="eyebrow dark-eyebrow">Interview Result</p>
          <h1>{result.title}</h1>
          <p>
            Final score, answer-wise feedback, and improvement suggestions.
          </p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="result-card">
          <div className="analysis-header">
            <div>
              <h2>Overall Performance</h2>
              <p>
                Status: <strong>{result.status}</strong> | Answered:{" "}
                {result.answered_questions}/{result.total_questions}
              </p>
            </div>

            <div className="score-badge">{result.average_score}%</div>
          </div>

          <p>
            <strong>Overall Feedback:</strong> {result.overall_feedback}
          </p>

          <Link className="primary-link-btn dark-btn" to="/candidate/interviews">
            Back to Interviews
          </Link>
        </div>

        <h2>Answer-wise Feedback</h2>

        <div className="analysis-list">
          {result.answers.map((item, index) => (
            <div className="analysis-card" key={item.id}>
              <div className="analysis-header">
                <div>
                  <h2>Question {index + 1}</h2>
                  <p>{item.question}</p>
                </div>

                <div className="score-badge">{item.score}%</div>
              </div>

              <p>
                <strong>Your Answer:</strong> {item.answer}
              </p>

              <p>
                <strong>Feedback:</strong> {item.feedback}
              </p>

              <p>
                <strong>Improvement Tip:</strong> {item.improvement_tip}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default InterviewResult;