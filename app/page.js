import LogoutButton from "@/components/auth/LogoutButton";
import React from "react";

const Home = () => {
  return (
    <div>
      <LogoutButton />
      <h1 className="text-red-500">سلام حسن</h1>
    </div>
  );
};

export default Home;
