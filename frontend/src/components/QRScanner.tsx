import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import AmountInput from './AmountInput';
import { QrCode } from 'lucide-react';
import axios from "axios";


const QRScanner: React.FC = () => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [showAmountInput, setShowAmountInput] = useState(false);
    // State to manage whether the second button is visible
    const [showSecondButton, setShowSecondButton] = useState<boolean>(false);

  const BASE_URL = "http://localhost:3000/api/intent"; // Replace with your server's base URL

  // 3. Create a New Intent (POST with Body)
  const createIntent = async (intentData: { username: string; serialNo: number; upiId: string | null; price: number }) => {
    try {
      console.log("Creating Intent:", intentData);
        const response = await axios.post(`${BASE_URL}/create`, intentData);
        console.log("Intent Created:", response.status);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error creating intent:", error.response.data);
        } else {
            console.error("Error creating intent:", error);
        }
    }
  };
  const handleScan = (result: any) => {
    if (result) {
      setQrData(result?.text);
      setShowAmountInput(true);
    }
  };

  const handleSubmit = async (amount: number) => {
    setShowSecondButton(true);
    console.log('QR Data:', qrData);
    console.log('Amount:', amount);
    let serialNo = 5;
    if (qrData) {
      const croppedString = qrData.split("pa=")[1].split("&")[0];
      try {
        await createIntent({
          username: "user1",
          serialNo: 1,
          upiId: croppedString,
          price: amount,
        });
        serialNo++;
        console.log('Intent created successfully');
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to create intent:', error.message);
        } else {
          console.error('Failed to create intent:', error);
        }
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    } else {
      console.error('QR Data is null');
    }
  };

  const getquotes = async (serialNo: number) => {
    try {
      //console.log("Creating Intent:", intentData);
        const response = await axios.get(`http://localhost:3000/api/quote/getallquotes/${serialNo}`);
        return response.data[0].price>response.data[1].price?response.data[1].price:response.data[0].price;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error creating intent:", error.response.data);
        } else {
            console.error("Error creating intent:", error);
        }
    }
  };
    // Function to handle the second button click
    const handleSecondButtonClick = () => {
      const response = getquotes(1);
      response.then((res) => {
        console.log("Min Proposed Price:", res);
      });
      //alert("Second Button Clicked!");
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!showAmountInput ? (
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <QrCode className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Scan UPI QR Code</h1>
            </div>
            <div className="relative">
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-indigo-400 rounded-lg animate-pulse" />
                </div>
              </div>
              <QrReader
                onResult={handleScan}
                constraints={{ facingMode: 'environment' }}
                className="rounded-lg overflow-hidden"
                containerStyle={{ borderRadius: '0.5rem' }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-300 text-sm">
                Position the QR code within the frame to scan
              </p>
            </div>
          </div>
        ) : (
          <AmountInput onSubmit={handleSubmit} />
        )}

                   {/* Conditionally Rendered Second Button */}
                   {showSecondButton && (
        <button
          onClick={handleSecondButtonClick}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            marginTop: "20px",
            display: "block",
          }}
        >
          Pay Min Proposed Price
        </button>
      )}
      </div>

    </div>
  );
};

export default QRScanner;