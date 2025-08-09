import { useState } from 'react'
import type { UserProfile } from '../services/profileService'

interface Payment {
  id: string
  amount: number
  tip: number
  date: string
  status: 'completed' | 'pending' | 'refunded'
  clientName?: string
  description?: string
}

interface DashboardProps {
  userProfile: UserProfile | null
  isLoading: boolean
}

const Dashboard = ({ userProfile, isLoading }: DashboardProps) => {
  const [payments] = useState<Payment[]>([
    {
      id: '1',
      amount: 200.00,
      tip: 30.00,
      date: '2024-01-15T10:30:00Z',
      status: 'completed',
      clientName: 'Sarah Johnson',
      description: 'Kitchen faucet repair'
    },
    {
      id: '2',
      amount: 150.00,
      tip: 22.50,
      date: '2024-01-14T14:15:00Z',
      status: 'completed',
      clientName: 'Mike Wilson',
      description: 'Bathroom tile installation'
    },
    {
      id: '3',
      amount: 75.00,
      tip: 15.00,
      date: '2024-01-13T09:45:00Z',
      status: 'pending',
      clientName: 'Lisa Chen',
      description: 'Door lock replacement'
    },
    {
      id: '4',
      amount: 300.00,
      tip: 45.00,
      date: '2024-01-12T16:20:00Z',
      status: 'completed',
      clientName: 'Robert Davis',
      description: 'Deck staining project'
    }
  ])


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'refunded':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTotalRevenue = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((total, payment) => total + payment.amount + payment.tip, 0)
  }

  const getTotalTips = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((total, payment) => total + payment.tip, 0)
  }

  return (
    <div className="min-h-screen bg-gray-light p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl sm:rounded-3xl lg:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 lg:mb-10 text-center shadow-lg border border-gray-100">
          <img 
            src="https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg" 
            alt={userProfile?.name || 'User'} 
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full mx-auto mb-3 sm:mb-4 lg:mb-5 object-cover border-4 border-white shadow-xl"
          />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            {isLoading ? (
              'Loading...'
            ) : (
              `Welcome ${userProfile?.name || 'User'}`
            )}
          </h1>
          <p className="text-green-100 text-base sm:text-lg lg:text-xl font-medium">
            {isLoading ? (
              'Loading business info...'
            ) : (
              userProfile?.business_name || 'Business Owner'
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-medium text-sm sm:text-base lg:text-lg font-medium mb-2">Total Revenue</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-dark">${getTotalRevenue().toFixed(2)}</p>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ml-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-medium text-sm sm:text-base lg:text-lg font-medium mb-2">Total Tips</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-dark">${getTotalTips().toFixed(2)}</p>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ml-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-medium text-sm sm:text-base lg:text-lg font-medium mb-2">Total Payments</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-dark">{payments.length}</p>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ml-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-5 sm:px-8 lg:px-10 py-5 sm:py-6 lg:py-8 border-b border-gray-100">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-dark mb-2">Recent Payments</h2>
            <p className="text-gray-medium text-sm sm:text-base lg:text-lg">Track all your payment transactions</p>
          </div>

          <div className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <div key={payment.id} className="p-5 sm:p-8 lg:p-10 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 lg:gap-8">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 lg:gap-8">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-dark text-lg sm:text-xl lg:text-2xl mb-2">
                          {payment.clientName || 'Anonymous'}
                        </h3>
                        <p className="text-gray-medium text-base sm:text-lg lg:text-xl mb-2">
                          {payment.description}
                        </p>
                        <p className="text-gray-medium text-sm sm:text-base lg:text-lg">
                          {formatDate(payment.date)}
                        </p>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-4 sm:gap-3 lg:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="font-bold text-gray-dark text-xl sm:text-2xl lg:text-3xl mb-1">
                            ${(payment.amount + payment.tip).toFixed(2)}
                          </div>
                          <div className="text-gray-medium text-sm sm:text-base lg:text-lg">
                            ${payment.amount.toFixed(2)} + ${payment.tip.toFixed(2)} tip
                          </div>
                        </div>
                        
                        <span className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2 lg:py-3 rounded-full text-sm sm:text-base lg:text-lg font-medium border ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Payment Link Button */}
        <div className="mt-6 sm:mt-8 lg:mt-10 text-center">
          <button className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 sm:py-6 lg:py-8 px-8 sm:px-12 lg:px-16 rounded-2xl sm:rounded-3xl text-lg sm:text-xl lg:text-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:from-primary-dark hover:to-primary transform hover:scale-[1.02] active:scale-95 border border-primary-dark">
            <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-5">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              <span>Create New Payment Link</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard