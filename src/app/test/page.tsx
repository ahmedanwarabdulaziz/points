export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">✅ CADEALA Test Page</h1>
        <p className="text-gray-600 mb-4">If you can see this page, the deployment is working!</p>
        <div className="text-sm text-gray-500">
          <p>Timestamp: {new Date().toISOString()}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
        </div>
      </div>
    </div>
  );
}
