'use client';

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 animate-pulse">
    <div className="w-full h-48 bg-gray-300 rounded-t-lg mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
      <div className="h-10 bg-gray-300 rounded-full flex-1"></div>
      <div className="h-10 bg-gray-300 rounded-full flex-1"></div>
      <div className="h-10 bg-gray-300 rounded-full flex-1"></div>
    </div>
  </div>
);

export default SkeletonCard;
