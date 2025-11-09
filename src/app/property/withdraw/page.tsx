export default function WithdrawProperty() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Withdraw Property</h1>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Select Property to Withdraw</h2>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select a property</option>
              <option>Beautiful Family Home - A$450,000</option>
              <option>Modern Apartment - A$280,000</option>
              <option>Luxury Condo - A$650,000</option>
            </select>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Reason for Withdrawal</h2>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select a reason</option>
              <option>Property Sold</option>
              <option>No longer available</option>
              <option>Under contract</option>
              <option>Price adjustment needed</option>
              <option>Other</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide any additional details..."
            />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-800 font-semibold mb-2">Important Notice</h3>
            <p className="text-yellow-700 text-sm">
              Withdrawing a property will remove it from all listings immediately. This action cannot be undone.
            </p>
          </div>
          <div className="flex space-x-4">
            <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
              Withdraw Property
            </button>
            <button className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 