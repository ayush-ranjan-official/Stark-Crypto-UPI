import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { connect, disconnect } from "starknetkit"
import { RpcProvider, cairo } from "starknet"
import { InjectedConnector } from "starknetkit/injected"
import { WebWalletConnector } from "starknetkit/webwallet"

// ETH contract on Sepolia testnet
const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

const HomeScreen = () => {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<any>(null)
  const [address, setAddress] = useState<string>("")
  const [transferAmount, setTransferAmount] = useState<string>("")
  const [recipientAddress, setRecipientAddress] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const connectWallet = async () => {
    try {
      const result = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark",
        connectors: [
          new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
          new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
          new WebWalletConnector({ url: "https://web.argent.xyz" }),
        ],
      })

      if (result && result.wallet) {
        console.log("Connected wallet:", result.wallet)
        setWallet(result.wallet)
        if (result.connectorData?.account) {
          setAddress(result.connectorData.account)
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
      setWallet(null)
      setAddress("")
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
    }
  }

  const handleTransfer = async () => {
    if (!wallet || !recipientAddress || !transferAmount || !address) return

    setLoading(true)
    try {
      const amountInWei = cairo.uint256(BigInt(Number.parseFloat(transferAmount) * Math.pow(10, 18)))

      const calls = [
        {
          contract_address: ETH_ADDRESS,
          entry_point: "transfer",
          calldata: [recipientAddress, amountInWei.low, amountInWei.high],
        },
      ]

      const result = await wallet.request({
        type: "wallet_addInvokeTransaction",
        params: { calls },
      })

      console.log("Transaction submitted:", result.transaction_hash)

      const provider = new RpcProvider({ nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7" })
      await provider.waitForTransaction(result.transaction_hash)

      console.log("Transaction completed!")
      setTransferAmount("")
      setRecipientAddress("")
    } catch (error) {
      console.error("Transfer failed:", error)
    }
    setLoading(false)
  }

  return (
    <div className="h-screen bg-[#0B1223] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Welcome to CFI</h1>
              <p className="text-gray-400">
                Crypto to Fiat Interface - Seamlessly pay in local currency using your crypto assets
              </p>
            </div>

            {/* Wallet Connection Card */}
            <div className="bg-[#1A1F2E] rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Wallet Connection</h2>
                {!wallet ? (
                  <button
                    onClick={connectWallet}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={disconnectWallet}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              {address && (
                <p className="mt-4 text-gray-400">
                  Connected Address: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>

            {/* Transfer Section */}
            {wallet && (
              <div className="bg-[#1A1F2E] rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-6">Transfer Tokens</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-400 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      className="w-full bg-[#0B1223] text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="0x..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Amount (ETH)</label>
                    <input
                      type="number"
                      step="0.000000000000000001"
                      min="0"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full bg-[#0B1223] text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                  <button
                    onClick={handleTransfer}
                    disabled={loading || !recipientAddress || !transferAmount}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
                  >
                    {loading ? "Processing..." : "Transfer"}
                  </button>
                </div>
              </div>
            )}

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              <div
                onClick={() => navigate("/user")}
                className="bg-[#1A1F2E] rounded-2xl p-6 cursor-pointer hover:bg-[#242938] transition-colors duration-200"
              >
                <div className="text-center">
                  <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">I'm a Foreigner</h2>
                  <p className="mt-2 text-gray-400">Pay in local currency using your crypto assets</p>
                </div>
              </div>

              <div
                onClick={() => navigate("/solver")}
                className="bg-[#1A1F2E] rounded-2xl p-6 cursor-pointer hover:bg-[#242938] transition-colors duration-200"
              >
                <div className="text-center">
                  <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">I'm an Intent Solver</h2>
                  <p className="mt-2 text-gray-400">Facilitate transactions and earn rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen

