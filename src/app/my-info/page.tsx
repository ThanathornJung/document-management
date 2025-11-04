"use client";
import { useAuth, User } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import PageWrapper from '../../components/PageWrapper';
import LoadingModal from '../../components/LoadingModal';

const formatDate = (date: Date | string | undefined) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${month}/${day}/${year}`;
};

const isDate = (value: unknown): value is Date => {
  return value instanceof Date;
};

export default function MyInfoPage() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUserInfo, setEditableUserInfo] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    const fetchUserInfo = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        
        // Convert ISO strings back to Date objects
        const processedData = {
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        };

        if (isMounted) {
          setUserInfo(processedData);
          setEditableUserInfo(processedData);
          setIsLoading(false);
          setError(null);
        }
      } catch (error) {
        console.error("MyInfoPage - Error fetching user info:", error);
        if (isMounted) {
          setUserInfo(null);
          setIsLoading(false);
          setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
      // isLoading is already true initially, fetchUserInfo will set it to false
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
        body: JSON.stringify({
          ...editableUserInfo,
          birthDate: editableUserInfo.birthDate && isDate(editableUserInfo.birthDate) ? editableUserInfo.birthDate.toISOString().split('T')[0] : editableUserInfo.birthDate,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData = await res.json();
      setUserInfo(responseData.user);
      setEditableUserInfo(responseData.user);
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
      <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">My Info</h1>

      {!user ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Login Required</p>
          <p>Please log in to view your information.</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : userInfo ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 max-w-lg mx-auto">
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userInfo.username}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Password</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">********</dd>
              </div>
              {isEditing ? (
                <>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        value={editableUserInfo?.firstName || ""}
                        onChange={(e) =>
                          setEditableUserInfo({
                            ...editableUserInfo!,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-gray-50 text-gray-900 border border-gray-300"
                      />
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="text"
                        value={editableUserInfo?.lastName || ""}
                        onChange={(e) =>
                          setEditableUserInfo({
                            ...editableUserInfo!,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full p-2 rounded bg-gray-50 text-gray-900 border border-gray-300"
                      />
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userInfo.email}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <input
                        type="date"
                        value={editableUserInfo?.birthDate && isDate(editableUserInfo.birthDate) ? editableUserInfo.birthDate.toISOString().split('T')[0] : ""}
                        onChange={(e) => {
                          const newBirthDate = e.target.value ? new Date(e.target.value) : undefined;
                          setEditableUserInfo({
                            ...editableUserInfo!,
                            birthDate: newBirthDate,
                          });
                        }}
                        className="w-full p-2 rounded bg-gray-50 text-gray-900 border border-gray-300"
                      />
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userInfo.firstName}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userInfo.lastName}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userInfo.email}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(userInfo.birthDate)}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            {isEditing ? (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditableUserInfo(userInfo);
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 text-lg">No user information available.</div>
      )}
      <LoadingModal isOpen={isLoading} message="Loading user information..." />
    </PageWrapper>
  );
}
