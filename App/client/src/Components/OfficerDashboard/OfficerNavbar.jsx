import { Link, useSearchParams, useLocation } from "react-router-dom";

export default function OfficerNavbar() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const tab = searchParams.get("tab");
    const isCARoute = location.pathname === "/ca";

    return (
        <nav className="bg-white shadow px-8 py-4 flex items-center">
            <div className="join">
                <Link
                    to="/officer"
                    className={`btn join-item ${!tab && !isCARoute ? "btn-primary" : ""}`}
                >
                    Đã xác thực
                </Link>
                <Link
                    to="/officer?tab=passport"
                    className={`btn join-item ${tab === "passport" ? "btn-primary" : ""}`}
                >
                    Chờ xác thực
                </Link>
            </div>

        </nav>
    );
}