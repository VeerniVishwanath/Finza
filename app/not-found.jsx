import Image from "next/image";
import React from "react";

function page() {
  return (
    <div className="w-dvw h-[80dvh] flex justify-center items-center text-5xl font-bold ">
      <Image src={"/not-found.webp"} width={500} height={500} alt="not-found" />
    </div>
  );
}

export default page;
