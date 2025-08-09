import { useState } from 'react'
import type { UserProfile } from '../services/profileService'

interface PaymentPageProps {
  userProfile: UserProfile | null
  isLoading: boolean
}

const PaymentPage = ({ userProfile, isLoading }: PaymentPageProps) => {
  const [baseAmount, setBaseAmount] = useState(200.00)
  const [baseAmountInput, setBaseAmountInput] = useState('200.00')
  const [selectedTip, setSelectedTip] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [customTipDisplay, setCustomTipDisplay] = useState('')
  
  const tipPercentages = [10, 15, 20]
  
  const calculateTipAmount = (percentage: number) => {
    return (baseAmount * percentage) / 100
  }
  
  const getTotalAmount = () => {
    if (customTip) {
      return baseAmount + parseFloat(customTip)
    }
    return baseAmount + calculateTipAmount(selectedTip)
  }
  
  const handleTipSelect = (percentage: number) => {
    if (selectedTip === percentage) {
      setSelectedTip(0)
    } else {
      setSelectedTip(percentage)
    }
    setCustomTip('')
    setCustomTipDisplay('')
  }
  
  const handleCustomTipChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '')
    
    if (numericValue === '' || /^\d*\.?\d{0,2}$/.test(numericValue)) {
      setCustomTipDisplay(numericValue ? `$${numericValue}` : '')
      
      const parsedValue = parseFloat(numericValue)
      if (!isNaN(parsedValue) && parsedValue >= 1) {
        setCustomTip(numericValue)
        setSelectedTip(0)
      } else if (numericValue === '') {
        setCustomTip('')
        setSelectedTip(0)
      }
    }
  }
  
  const handleCustomTipBlur = () => {
    if (customTip) {
      const parsedValue = parseFloat(customTip)
      if (parsedValue < 1) {
        setCustomTip('1.00')
        setCustomTipDisplay('$1.00')
      } else {
        const formatted = parsedValue.toFixed(2)
        setCustomTip(formatted)
        setCustomTipDisplay(`$${formatted}`)
      }
    } else {
      setCustomTipDisplay('')
    }
  }
  
  const handleBaseAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '')
    if (numericValue === '' || /^\d*\.?\d{0,2}$/.test(numericValue)) {
      setBaseAmountInput(numericValue)
      if (numericValue && !isNaN(parseFloat(numericValue))) {
        setBaseAmount(parseFloat(numericValue))
      } else if (numericValue === '') {
        setBaseAmount(0)
      }
    }
  }
  
  const handleBaseAmountBlur = () => {
    if (baseAmountInput === '' || isNaN(parseFloat(baseAmountInput))) {
      setBaseAmountInput('1.00')
      setBaseAmount(1)
    } else {
      const parsedValue = parseFloat(baseAmountInput)
      if (parsedValue < 1) {
        setBaseAmountInput('1.00')
        setBaseAmount(1)
      } else {
        const formatted = parsedValue.toFixed(2)
        setBaseAmountInput(formatted)
        setBaseAmount(parseFloat(formatted))
      }
    }
  }
  
  const isValidPayment = () => {
    return baseAmount >= 1
  }
  
  const handlePayNow = () => {
    console.log('Proceeding to Stripe Checkout with amount:', getTotalAmount())
  }

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center p-3 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center lg:items-stretch">
        {/* Left side - QR Code */}
        <div className="flex-shrink-0 order-2 lg:order-1">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-gray-100 text-center">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-2xl border-2 border-dashed border-gray-200 inline-block">
                {/* QR Code SVG */}
                <svg 
                  className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto" 
                  viewBox="0 0 200 200" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* QR Code Pattern */}
                  <rect width="200" height="200" fill="white"/>
                  
                  {/* Corner squares */}
                  <rect x="10" y="10" width="60" height="60" fill="black"/>
                  <rect x="20" y="20" width="40" height="40" fill="white"/>
                  <rect x="30" y="30" width="20" height="20" fill="black"/>
                  
                  <rect x="130" y="10" width="60" height="60" fill="black"/>
                  <rect x="140" y="20" width="40" height="40" fill="white"/>
                  <rect x="150" y="30" width="20" height="20" fill="black"/>
                  
                  <rect x="10" y="130" width="60" height="60" fill="black"/>
                  <rect x="20" y="140" width="40" height="40" fill="white"/>
                  <rect x="30" y="150" width="20" height="20" fill="black"/>
                  
                  {/* QR pattern data */}
                  <rect x="80" y="10" width="10" height="10" fill="black"/>
                  <rect x="100" y="10" width="10" height="10" fill="black"/>
                  <rect x="120" y="10" width="10" height="10" fill="black"/>
                  
                  <rect x="10" y="80" width="10" height="10" fill="black"/>
                  <rect x="30" y="80" width="10" height="10" fill="black"/>
                  <rect x="50" y="80" width="10" height="10" fill="black"/>
                  <rect x="80" y="80" width="10" height="10" fill="black"/>
                  <rect x="100" y="80" width="10" height="10" fill="black"/>
                  <rect x="120" y="80" width="10" height="10" fill="black"/>
                  <rect x="140" y="80" width="10" height="10" fill="black"/>
                  <rect x="160" y="80" width="10" height="10" fill="black"/>
                  <rect x="180" y="80" width="10" height="10" fill="black"/>
                  
                  <rect x="80" y="30" width="10" height="10" fill="black"/>
                  <rect x="80" y="50" width="10" height="10" fill="black"/>
                  <rect x="80" y="100" width="10" height="10" fill="black"/>
                  <rect x="80" y="120" width="10" height="10" fill="black"/>
                  <rect x="80" y="140" width="10" height="10" fill="black"/>
                  <rect x="80" y="160" width="10" height="10" fill="black"/>
                  <rect x="80" y="180" width="10" height="10" fill="black"/>
                  
                  <rect x="100" y="30" width="10" height="10" fill="black"/>
                  <rect x="100" y="100" width="10" height="10" fill="black"/>
                  <rect x="100" y="120" width="10" height="10" fill="black"/>
                  <rect x="100" y="160" width="10" height="10" fill="black"/>
                  <rect x="100" y="180" width="10" height="10" fill="black"/>
                  
                  <rect x="120" y="50" width="10" height="10" fill="black"/>
                  <rect x="120" y="100" width="10" height="10" fill="black"/>
                  <rect x="120" y="140" width="10" height="10" fill="black"/>
                  <rect x="120" y="180" width="10" height="10" fill="black"/>
                  
                  <rect x="140" y="30" width="10" height="10" fill="black"/>
                  <rect x="140" y="100" width="10" height="10" fill="black"/>
                  <rect x="140" y="120" width="10" height="10" fill="black"/>
                  <rect x="140" y="160" width="10" height="10" fill="black"/>
                  
                  <rect x="160" y="50" width="10" height="10" fill="black"/>
                  <rect x="160" y="100" width="10" height="10" fill="black"/>
                  <rect x="160" y="140" width="10" height="10" fill="black"/>
                  <rect x="160" y="180" width="10" height="10" fill="black"/>
                  
                  <rect x="180" y="30" width="10" height="10" fill="black"/>
                  <rect x="180" y="100" width="10" height="10" fill="black"/>
                  <rect x="180" y="120" width="10" height="10" fill="black"/>
                  <rect x="180" y="160" width="10" height="10" fill="black"/>
                  
                  {/* Center branding area */}
                  <rect x="85" y="85" width="30" height="30" fill="white" stroke="#00ce7c" strokeWidth="2"/>
                  <circle cx="100" cy="100" r="8" fill="#00ce7c"/>
                </svg>
              </div>
            </div>
            
            {/* Pay.me Branding */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="bg-gradient-to-br from-primary to-primary-dark p-2 sm:p-3 rounded-xl">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-dark">Pay.me</h2>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-medium">Scan to pay securely</p>
              <div className="pt-2 sm:pt-3">
                <div className="inline-flex items-center gap-1 sm:gap-2 bg-primary bg-opacity-10 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium text-primary">Active Payment Link</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Payment Form */}
        <div className="flex-1 order-1 lg:order-2 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary to-primary-dark px-4 sm:px-6 py-4 sm:py-6 text-center">
              <img 
                src="https://cdn.pixabay.com/photo/2016/11/21/12/42/beard-1845166_1280.jpg" 
                alt={userProfile?.name || 'User'} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 sm:mb-3 object-cover border-4 border-white shadow-md"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {isLoading ? (
                  'Loading...'
                ) : (
                  userProfile?.name || 'User'
                )}
              </h1>
              <p className="text-green-100 text-sm sm:text-lg font-medium">
                {isLoading ? (
                  'Loading business info...'
                ) : (
                  userProfile?.business_name || 'Business Owner'
                )}
              </p>
              <p className="text-green-100 text-xs sm:text-sm mt-1">Complete your payment securely</p>
            </div>
            
            {/* Payment Amount */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="text-center mb-4 sm:mb-6">
            <label className="block text-gray-dark text-sm font-semibold mb-2">
              Payment Amount
            </label>
            <div className="relative max-w-xs mx-auto">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-medium text-xl sm:text-2xl font-bold">
                $
              </span>
              <input
                type="text"
                value={baseAmountInput}
                onChange={(e) => handleBaseAmountChange(e.target.value)}
                onBlur={handleBaseAmountBlur}
                className="w-full pl-8 sm:pl-10 pr-4 py-3 sm:py-4 text-2xl sm:text-4xl font-bold text-gray-dark text-center border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-sm transition-all duration-200"
                placeholder="1.00"
              />
              <div className="text-xs text-gray-medium mt-1 sm:mt-2 font-medium">USD</div>
            </div>
          </div>
          
          {/* Tip Selection */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-dark mb-3 sm:mb-4 text-center">
              Add a tip
            </h3>
            
            {/* Tip Percentage Buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              {tipPercentages.map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handleTipSelect(percentage)}
                  disabled={customTip !== ''}
                  className={`py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 ${
                    customTip !== ''
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-100 shadow-sm'
                      : selectedTip === percentage
                      ? 'bg-primary text-white shadow-xl shadow-primary/30 transform scale-105 border-2 border-primary-dark'
                      : 'bg-white text-gray-dark hover:bg-gray-50 border-2 border-gray-300 shadow-lg hover:shadow-xl hover:border-gray-400 hover:scale-[1.02]'
                  }`}
                >
                  {percentage}%
                  <div className={`text-xs sm:text-sm font-medium mt-1 ${
                    customTip !== ''
                      ? 'text-gray-400'
                      : selectedTip === percentage ? 'text-white' : 'text-gray-medium'
                  }`}>
                    ${calculateTipAmount(percentage).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Custom Tip Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-dark mb-2">
                Custom tip amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customTipDisplay}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  onBlur={handleCustomTipBlur}
                  placeholder="$1.00"
                  className="w-full pl-4 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-base sm:text-lg font-medium bg-white shadow-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>
          
          {/* Total Amount */}
          <div className="bg-gradient-to-r from-gray-light to-gray-50 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border border-gray-200">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-medium font-medium text-sm sm:text-base">Subtotal:</span>
              <span className="font-semibold text-gray-dark text-sm sm:text-base">${baseAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-medium font-medium text-sm sm:text-base">Tip:</span>
              <span className="font-semibold text-gray-dark text-sm sm:text-base">
                ${customTip ? parseFloat(customTip).toFixed(2) : calculateTipAmount(selectedTip).toFixed(2)}
              </span>
            </div>
            <hr className="my-3 border-gray-300" />
            <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
              <span className="text-gray-dark">Total:</span>
              <span className="text-primary">${getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
          
          {/* Pay Now Button */}
          <button
            onClick={handlePayNow}
            disabled={!isValidPayment()}
            className={`w-full font-bold py-4 sm:py-5 px-6 rounded-2xl text-lg sm:text-xl transition-all duration-300 border ${
              isValidPayment()
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg hover:shadow-xl hover:from-primary-dark hover:to-primary transform hover:scale-[1.02] active:scale-95 border-primary-dark'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200 shadow-sm'
            }`}
          >
            {isValidPayment() ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Pay ${getTotalAmount().toFixed(2)}
              </div>
            ) : (
              'Enter minimum $1.00'
            )}
          </button>
          
          {/* Security Badge */}
          <div className="text-center mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-medium font-medium flex items-center justify-center gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secured by Stripe
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage