import { Logo } from "@/components/logo"
import Button from "@/src/components/ui/button"
import Link from "next/link"

export const Navbar = () => {
  return (
    <div className="fixed top-0 w-full
     h-14 px-4 border-b shadow-sm bg-white flex items-center">
        <div className="md:max-w-screen-2xl mx-auto 
        flex items-center w-full justify-between">
            <Logo />
            <div className="space-x-4 md:w-auto flex items-center justify-between w-full">
                <Button  variant="primary">
                    <Link href="/user/signup">
                        Login
                    </Link> 
                </Button>
                <Button variant="secondary">
                    <Link href="/user/signup">
                        Get Taskify for free
                    </Link>
                </Button>

            </div>
        </div>
    </div>
  )
}
