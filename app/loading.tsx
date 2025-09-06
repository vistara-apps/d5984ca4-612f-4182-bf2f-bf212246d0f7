export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Loading Pocket Rights
        </h2>
        <p className="text-gray-300">Preparing your rights information...</p>
      </div>
    </div>
  );
}
