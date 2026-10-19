"use client";
import LoginButton from "@/components/LoginButton";
import { SignedOut, UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";

function HeaderProfileBtn() {
    return (
        <>
            <UserButton>
                {/* customized button that is coming from clerk to navigate user to profile after clicked on the profile */}
                <UserButton.MenuItems>
                    <UserButton.Link
                        label="Profile"
                        labelIcon={<User className="size-4" />}
                        href="/profile"
                    />
                </UserButton.MenuItems>
            </UserButton>

            <SignedOut>
                <LoginButton />
            </SignedOut>
        </>
    );
}
export default HeaderProfileBtn;