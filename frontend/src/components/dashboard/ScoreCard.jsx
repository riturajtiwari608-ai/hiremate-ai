export default function ScoreCard({ title, score }) {
    return (
        <div className="card shadow h-100">
            <div className="card-body text-center">
                <h5 className="card-title">
                    {title}
                </h5>

                <h1 className="display-4 text-primary">
                    {score}%
                </h1>
            </div>
        </div>
    );
}