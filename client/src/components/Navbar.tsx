import Link from "next/link";

export default function Navbar() {
    return (
        <div className="navbar navbar-glass rounded-lg">
            <div className="navbar-start">
                <a className="navbar-item">Backup Scheduler</a>
            </div>
            <div className="navbar-end">
                <div className="avatar avatar-ring avatar-md">
                    <div className="dropdown-container">
                        <div className="dropdown dropdown-hover">
                            <label className="btn btn-ghost flex cursor-pointer px-0" tabIndex={0}>
                                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024e" alt="avatar" />
                            </label>
                            <div className="dropdown-menu dropdown-menu-bottom-left">
                                <Link tabIndex={-1} className="dropdown-item text-sm" href="/devices">Dispositivos</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}