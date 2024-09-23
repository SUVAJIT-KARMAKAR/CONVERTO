// COMPONENTS :: NAVBAR :: IMPORTS 
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "./mode-toggle";
import { LuMenu } from "react-icons/lu";
import { FaFileCode } from "react-icons/fa";

export default function Navbar({ }): any {
    return (
        <nav className="fixed z-50 flex items-center justify-between w-full h-24 px-4 py-10 backdrop-blur-md bg-background bg-opacity-30 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
            <Link href="/">
                <FaFileCode 
                    size={35}
                    color="#AD49E1"
                />
            </Link>
            <div className="items-center hidden gap-2 md:flex">
                <ModeToggle />
                <Link href="">
                    <Button
                        variant="default"
                        className="items-center hidden gap-2 bg-purple-600 rounded-full w-fit md:flex"
                        size="lg"
                    >
                        <span> GITHUB REPOSITORY </span>
                        <span className="text-xl">
                            <BsGithub />
                        </span>
                    </Button>
                </Link>
            </div>

            {/* MOBILE NAV */}
            <Sheet>
                <SheetTrigger className="block p-3 md:hidden">
                    <span className="text-2xl text-slate-950 dark:text-slate-200">
                        <LuMenu />
                    </span>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetDescription>
                            <div className="flex flex-col w-full h-full mt-10">
                                <ModeToggle />
                            </div>
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </nav>
    );
}
