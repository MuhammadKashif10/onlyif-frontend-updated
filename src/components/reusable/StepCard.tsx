interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stepNumber?: number;
  isActive?: boolean;
  className?: string;
}

export default function StepCard({ 
  icon, 
  title, 
  description, 
  stepNumber, 
  isActive = false,
  className = ""
}: StepCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 ${
      isActive ? 'ring-2 ring-blue-500' : ''
    } ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Step Number */}
        {stepNumber && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {stepNumber}
          </div>
        )}
        
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isActive ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <div className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
            {icon}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${
            isActive ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
} 