import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="container-fluid p-0">
            <Navbar />

            <div className="row g-0">

                <div className="col-md-2">
                    <Sidebar />
                </div>

                <div className="col-md-10 p-4 bg-light min-vh-100">
                    {children}
                </div>

            </div>
        </div>
    );
}