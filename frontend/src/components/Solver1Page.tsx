import React, { useState, useEffect } from "react";
import { RpcProvider, Contract, constants } from "starknet";
import { connect, disconnect } from "starknetkit";
import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";

// Contract ABI would be imported from your compiled contract
const CONTRACT_ADDRESS = "0x";
const ABI = []; // Your contract ABI

const SolverPage: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [formResult, setFormResult] = useState<string>("");
  const [provider, setProvider] = useState<RpcProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connection, setConnection] = useState<any>(null);

  const [formData, setFormData] = useState<{ name: string; amount: number }>({
    name: "",
    amount: 0,
  });

  const BASE_URL = "http://localhost:3000/api/intent";

  // Initialize provider and contract
  useEffect(() => {
    const initializeContract = async () => {
      // Using Sepolia testnet as default
      const provider = new RpcProvider({ 
        nodeUrl: constants.NetworkName.SN_SEPOLIA 
      });
      
      const { abi: contractAbi } = await provider.getClassAt(CONTRACT_ADDRESS);
      if (!contractAbi) throw new Error("No ABI found for contract");
      
      const contract = new Contract(contractAbi, CONTRACT_ADDRESS, provider);
      setProvider(provider);
      setContract(contract);
    };

    initializeContract();
  }, []);

  // Connect wallet function with latest StarknetKit
  const connectWallet = async () => {
    try {
      const connection = await connect({
        connectors: [
          new InjectedConnector({ options: { id: 'braavos' }}),
          new InjectedConnector({ options: { id: 'argentX' }}),
          new WebWalletConnector({ url: "https://web.argent.xyz" })
        ],
        modalMode: "alwaysAsk",
        modalTheme: "light"
      });
      
      if (connection && connection.wallet) {
        setConnection(connection.wallet);
        // setWalletAddress(connection.wallet.selectedAddress);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    try {
      await disconnect();
      setConnection(null);
      setWalletAddress(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const getIntent = async (serialNo: number) => {
    try {
      const response = await fetch(`${BASE_URL}/getintent/${serialNo}`);
      const data = await response.json();
      console.log("Intent Data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching intent:", error);
      throw error;
    }
  };

  // const createQuote = async (quoteData: { 
  //   serialNo: number; 
  //   walletAddress: string | null; 
  //   price: number 
  // }) => {
  //   try {
  //     if (!contract || !connection) {
  //       throw new Error("Contract or wallet not initialized");
  //     }

  //     // Get intent data for validation
  //     const intentData = await getIntent(quoteData.serialNo);
  //     const intentAmount = intentData.amount;

  //     // Update contract connection with wallet
  //     contract.connect(connection);

  //     // Validate quote
  //     const isValid = await contract.validate_quote(intentAmount, quoteData.price);
  //     if (!isValid) {
  //       throw new Error("Quote exceeds maximum allowed markup (1.4x)");
  //     }

  //     const tokenAmount = await contract.get_token_equivalent(quoteData.price);
  //     console.log("Token amount required:", tokenAmount);

  //     const response = await fetch(`${BASE_URL}/quote/create`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         ...quoteData,
  //         tokenAmount,
  //       })
  //     });

  //     return response.json();
  //   } catch (error) {
  //     console.error("Error in quote creation:", error);
  //     throw error;
  //   }
  // };

  const handleClick = async () => {
    try {
      const serialNo = 1;
      const intentData = await getIntent(serialNo);
      setResult(JSON.stringify(intentData));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!walletAddress) {
        await connectWallet();
        return;
      }

      setFormResult("Processing...");

      // const response = await createQuote({
      //   serialNo: 1,
      //   walletAddress: walletAddress,
      //   price: formData.amount,
      // });

      setFormResult("Quote created successfully! Waiting for acceptance...");
    } catch (error: any) {
      setFormResult(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "amount" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="text-center mt-12">
      <button 
        onClick={walletAddress ? disconnectWallet : connectWallet} 
        className="px-5 py-2.5 text-base mb-5"
      >
        {walletAddress ? `Disconnect ${walletAddress.slice(0, 6)}...` : "Connect Wallet"}
      </button>

      <button 
        onClick={handleClick} 
        className="px-5 py-2.5 text-base ml-2.5"
      >
        Get Intent
      </button>

      {result && (
        <div className="mt-5 text-lg text-blue-600">
          <pre>{result}</pre>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="mt-8">
        <div className="mb-2.5">
          <label>
            Your Wallet Address:
            <input
              type="text"
              value={walletAddress || ""}
              disabled
              className="ml-2.5 p-1.5 text-base w-96"
            />
          </label>
        </div>
        <div className="mb-2.5">
          <label>
            Quote Amount (INR):
            <input
              type="number"
              name="amount"
              value={formData.amount || ""}
              onChange={handleInputChange}
              className="ml-2.5 p-1.5 text-base"
            />
          </label>
        </div>
        <button 
          type="submit" 
          className="px-5 py-2.5 text-base"
          disabled={!walletAddress}
        >
          Submit Quote
        </button>
      </form>

      {formResult && (
        <div 
          className={`mt-5 text-lg ${
            formResult.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {formResult}
        </div>
      )}
    </div>
  );
};

export default SolverPage;