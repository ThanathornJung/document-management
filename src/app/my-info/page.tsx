"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email?: string;
  tel?: string;
};

export default function MyInfoPage() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      fetch(`/api/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => setUserInfo(data));
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Info</h1>
      {userInfo ? (
        <div>
          <p>
            <strong>Username:</strong> {userInfo.username}
          </p>
          <p>
            <strong>First Name:</strong> {userInfo.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {userInfo.lastName}
          </p>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
          <p>
            <strong>Birth Date:</strong> {userInfo.birthDate}
          </p>
          <p>
            <strong>Telephone:</strong> {userInfo.tel}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

