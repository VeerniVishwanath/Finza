import { checkUser } from "@/lib/checkUser";
import NavBar from "./NavBar";

async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 z-10  backdrop-blur-lg shadow-sm flex justify-center w-full mx-auto ">
      <NavBar />
    </header>
  );
}

export default Header;
