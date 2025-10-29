"use client";
import { useAuth, User } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import PageWrapper from '../../components/PageWrapper';

export default function MyInfoPage() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUserInfo, setEditableUserInfo] = useState<User | null>(null);

  useEffect(() => {
    // ถ้าไม่มี user ให้ return เลย
    if (!user?.id) {
      return;
    }

    // ประกาศ flag เพื่อป้องกัน race condition
    let isMounted = true;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        if (isMounted) {
          setUserInfo(data);
          setEditableUserInfo(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("MyInfoPage - Error fetching user info:", error);
        if (isMounted) {
          setUserInfo(null);
          setIsLoading(false);
        }
      }
    };

    fetchUserInfo();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // แยก effect สำหรับจัดการเมื่อ user เปลี่ยน
  useEffect(() => {
    if (!user) {
      setUserInfo(null);
      setIsLoading(false);
    } else if (user.id) {
      setIsLoading(true);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id || !editableUserInfo) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editableUserInfo),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const updatedUser = await res.json();
      setUserInfo(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("MyInfoPage - Error saving user info:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4 font-press-start text-yellow-400 text-center">My Info</h1>
      
      {!user ? (
        <div className="bg-yellow-900 border-l-4 border-yellow-400 text-yellow-200 p-4 font-press-start" role="alert">
          <p className="font-bold">Login Required</p>
          <p>Please log in to view your information.</p>
        </div>
      ) : isLoading ? (
        <div className="bg-blue-900 border-l-4 border-blue-400 text-blue-200 p-4 font-press-start" role="alert">
          <p className="font-bold">Loading</p>
          <p>Loading user information...</p>
        </div>
      ) : userInfo ? (
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6 border border-yellow-400 max-w-lg mx-auto">
          <div className="border-t border-gray-700 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-700">
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-yellow-400">Username</dt>
                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                  {userInfo.username}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-yellow-400">Password</dt>
                <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">********</dd>
              </div>
              {isEditing ? (
                <>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">First Name</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        value={editableUserInfo?.firstName || ""}
                        onChange={(e) =>
                          setEditableUserInfo({
                            ...editableUserInfo!,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                      />
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Last Name</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        value={editableUserInfo?.lastName || ""}
                        onChange={(e) =>
                          setEditableUserInfo({
                            ...editableUserInfo!,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                      />
                    </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Email address</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.email}</dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Birth Date</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.birthDate}</dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Telephone</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.tel}</dd>
                  </div>
                  
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400"></dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 flex justify-end space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded font-press-start text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded font-press-start text-sm"
                      >
                        Cancel
                      </button>
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">First Name</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.firstName}</dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Last Name</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.lastName}</dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Email address</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.email}</dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Birth Date</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.birthDate}</dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400">Telephone</dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{userInfo.tel}</dd>
                  </div>
                  
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-yellow-400"></dt>
                    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 flex justify-end space-x-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded font-press-start text-sm"
                      >
                        Edit
                      </button>
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>
      ) : (
        <div className="bg-red-900 border-l-4 border-red-400 text-red-200 p-4 font-press-start" role="alert">
          <p className="font-bold">Error</p>
          <p>Unable to load user information.</p>
        </div>
      )}
    </PageWrapper>
  );
}