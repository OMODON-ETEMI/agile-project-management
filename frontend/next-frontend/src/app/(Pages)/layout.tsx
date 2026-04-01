// import { BoardProvider } from "@/src/Context/BoardContext"
import { Header } from "@/src/features/organisation/header"


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full">
            <Header />
            {/* <Navbar />  */}
            {children}
        </div>
    )
}

export default DashboardLayout