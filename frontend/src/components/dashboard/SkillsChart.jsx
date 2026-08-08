import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

export default function SkillsChart({ data }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">
                Skills Analysis
            </h2>

            <ResponsiveContainer
                width="100%"
                height={350}
            >
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis domain={[0, 100]} />

                    <Tooltip />

                    <Bar
                        dataKey="score"
                        radius={[8, 8, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}