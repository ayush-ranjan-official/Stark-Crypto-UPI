import { useNavigate } from 'react-router-dom';
import { Camera, MessageSquareText } from 'lucide-react';

const ForeignerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            Choose Payment Method
          </h1>
          <p className="mt-2 text-gray-400">
            Select how you want to make your payment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scan QR Option */}
          <div 
            onClick={() => navigate('/scan-qr')}
            className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="text-center">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Scan QR</h2>
              <p className="mt-2 text-gray-400">
                Scan UPI QR code to process payment
              </p>
            </div>
          </div>

          {/* AI Agent Option */}
          <div 
            onClick={() => navigate('/chat-agent')}
            className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="text-center">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquareText className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Chat with Agent</h2>
              <p className="mt-2 text-gray-400">
                Let our AI agent assist you with the payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignerPage;