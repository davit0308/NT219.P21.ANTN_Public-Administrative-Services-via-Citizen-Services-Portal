import { Link, useSearchParams } from "react-router-dom";

export default function OfficerNavbar() {
    const [searchParams] = useSearchParams();
    const tab = searchParams.get("tab");

    return (
        <nav className="bg-white shadow px-8 py-4 flex items-center">
            <div className="join">
                <Link
                    to="/officer"
                    className={`btn join-item ${!tab ? "btn-primary" : ""}`}
                >
                    Xét duyệt CCCD
                </Link>
                <Link
                    to="/officer?tab=passport"
                    className={`btn join-item ${tab === "passport" ? "btn-primary" : ""}`}
                >
                    Xét duyệt Hộ chiếu
                </Link>
            </div>
            <div className="ml-auto font-semibold text-indigo-700">
                Xin chào, Cán bộ xác thực!
            </div>
        </nav>
    );
}