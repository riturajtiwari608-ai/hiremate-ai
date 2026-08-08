import ScoreCard from "../components/dashboard/ScoreCard";
import SkillsChart from "../components/dashboard/SkillsChart";
import { useEffect, useState } from "react";
import { getDashboardAnalytics } from "../services/analyticsService";
import DashboardLayout from "../layouts/DashboardLayout";

export default function AnalyticsDashboard() {

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);

                setError("");

                const result =
                    await getDashboardAnalytics();

                setData(result);

            } catch (err) {

                console.error(err);

                setError(
                    "Unable to load analytics."
                );

            } finally {

                setLoading(false);

            }
        };


        loadDashboard();

    }, []);


    if (loading) {

        return (
            <DashboardLayout>

                <div className="text-center py-5">

                    <div
                        className="spinner-border"
                        role="status"
                    />

                    <p className="mt-3">
                        Loading analytics...
                    </p>

                </div>

            </DashboardLayout>
        );
    }


    if (error) {

        return (
            <DashboardLayout>

                <div className="alert alert-danger">
                    {error}
                </div>

            </DashboardLayout>
        );
    }


    if (!data) {

        return (
            <DashboardLayout>

                <div className="alert alert-info">
                    No analytics available yet.
                </div>

            </DashboardLayout>
        );
    }


    const chartData = [

        {
            name: "Technical",
            score: data.average_technical_score || 0,
        },

        {
            name: "Communication",
            score:
                data.average_communication_score || 0,
        },

        {
            name: "Confidence",
            score:
                data.average_confidence_score || 0,
        },

    ];


    return (
        <DashboardLayout>

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        Analytics Dashboard
                    </h2>

                    <p className="text-muted mb-0">
                        Track your interview performance.
                    </p>

                </div>

            </div>


            {/* SCORE CARDS */}

            <div className="row g-4 mb-4">

                <div className="col-sm-6 col-xl-3">

                    <ScoreCard
                        title="Overall Score"
                        score={data.overall_score || 0}
                    />

                </div>


                <div className="col-sm-6 col-xl-3">

                    <ScoreCard
                        title="Technical"
                        score={
                            data.average_technical_score || 0
                        }
                    />

                </div>


                <div className="col-sm-6 col-xl-3">

                    <ScoreCard
                        title="Communication"
                        score={
                            data.average_communication_score || 0
                        }
                    />

                </div>


                <div className="col-sm-6 col-xl-3">

                    <ScoreCard
                        title="Confidence"
                        score={
                            data.average_confidence_score || 0
                        }
                    />

                </div>

            </div>


            {/* INTERVIEW STATS */}

            <div className="row g-4 mb-4">

                <div className="col-md-6">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Total Interviews
                            </h6>

                            <h2 className="fw-bold">
                                {data.total_interviews || 0}
                            </h2>

                        </div>

                    </div>

                </div>


                <div className="col-md-6">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <h6 className="text-muted">
                                Completed Interviews
                            </h6>

                            <h2 className="fw-bold">
                                {data.completed_interviews || 0}
                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            {/* SKILL CHART */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-4">
                        Skill Performance
                    </h5>

                    <SkillsChart
                        data={chartData}
                    />

                </div>

            </div>


            {/* STRENGTHS / WEAKNESSES */}

            <div className="row g-4">

                <div className="col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">
                                💪 Strengths
                            </h5>

                            {data.strengths?.length ? (

                                <ul className="list-group list-group-flush">

                                    {data.strengths.map(
                                        (item, index) => (

                                            <li
                                                key={index}
                                                className="list-group-item px-0"
                                            >
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            ) : (

                                <p className="text-muted">
                                    Complete interviews to identify your strengths.
                                </p>

                            )}

                        </div>

                    </div>

                </div>


                <div className="col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">
                                🎯 Areas to Improve
                            </h5>

                            {data.weaknesses?.length ? (

                                <ul className="list-group list-group-flush">

                                    {data.weaknesses.map(
                                        (item, index) => (

                                            <li
                                                key={index}
                                                className="list-group-item px-0"
                                            >
                                                {item}
                                            </li>

                                        )
                                    )}

                                </ul>

                            ) : (

                                <p className="text-muted">
                                    Complete interviews to receive improvement feedback.
                                </p>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
}