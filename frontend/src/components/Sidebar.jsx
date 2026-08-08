

import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="bg-white border-end min-vh-100">

            <div className="list-group list-group-flush">

                <Link
                    to="/dashboard"
                    className="list-group-item list-group-item-action"
                >
                    Dashboard
                </Link>

                <Link
                    to="/analytics"
                    className="list-group-item list-group-item-action"
                >
                    Analytics
                </Link>

                <Link
                    to="/interview"
                    className="list-group-item list-group-item-action"
                >
                    AI Interview
                </Link>

                <Link
                    to="/resume"
                    className="list-group-item list-group-item-action"
                >
                    Resume Analyzer
                </Link>

                <Link
                    to="/profile"
                    className="list-group-item list-group-item-action"
                >
                    Profile
                </Link>

            </div>

        </div>
    );
}