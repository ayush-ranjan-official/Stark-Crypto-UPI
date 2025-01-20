import { Groq } from 'groq-sdk';
//import { provider, WALLET_ADDRESS, WALLET_PRIVATE_KEY, ETH_CONTRACT } from '../services/starknet';

import { type ChatCompletionMessageParam, type ChatCompletionTool } from 'groq-sdk/resources/chat/completions';

import axios from "axios";

import { connect } from "starknetkit"
import { RpcProvider, cairo } from "starknet"
import { InjectedConnector } from "starknetkit/injected"
import { WebWalletConnector } from "starknetkit/webwallet"

// ETH contract on Sepolia testnet
const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

// const [wallet, setWallet] = useState<any>(null)
// const [address, setAddress] = useState<string>("")
// const [transferAmount, setTransferAmount] = useState<string>("")
// const [recipientAddress, setRecipientAddress] = useState<string>("")
// const [loading, setLoading] = useState<boolean>(false)

// const connectWallet = async () => {
//   try {
//     const result = await connect({
//       modalMode: "alwaysAsk",
//       modalTheme: "dark",
//       connectors: [
//         new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
//         new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
//         new WebWalletConnector({ url: "https://web.argent.xyz" }),
//       ],
//     })

//     if (result && result.wallet) {
//       console.log("Connected wallet:", result.wallet)
//       setWallet(result.wallet)
//       if (result.connectorData?.account) {
//         setAddress(result.connectorData.account)
//       }
//     }
//   } catch (error) {
//     console.error("Error connecting wallet:", error)
//   }
// }

// const disconnectWallet = async () => {
//   try {
//     await disconnect()
//     setWallet(null)
//     setAddress("")
//   } catch (error) {
//     console.error("Error disconnecting wallet:", error)
//   }
// }



// require('dotenv').config();
// import { Send } from './send';
// import { getToken } from '../lib/starknet/voyager'
// import { useStarknet } from '@/lib/hooks/use-starknet'
// import { SendTokenArgs, sendToken } from '../lib/starknet/send'
// import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

interface ChainIdResponse {
    jsonrpc: string;
    id: number;
    result: string | { block_hash: string, block_number: string, calldata: string, max_fee: string, nonce: string, sender_address: string, signature: string, transaction_hash: string, type: string, version: string, actual_fee: string, events: string, execution_resources: string, execution_status: string, finality_status: string, messages_sent: string};
}

//const apiKeyGroq = process.env.GROQ_API_KEY;
const apiKeyGroq = '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';

const client = new Groq({ apiKey: apiKeyGroq, dangerouslyAllowBrowser: true });
const MODEL = 'llama3-70b-8192';

// function calculate(args: { expression: string }): any {
//     try {
//         const result = eval(args.expression);
//         return JSON.stringify({ result });
//     } catch {
//         return JSON.stringify({ error: "Invalid prompt" });
//     }
// }
const BASE_URL = "http://localhost:3000/api/intent"; // Replace with your server's base URL

// 3. Create a New Intent (POST with Body)
// const createIntent = async (intentData: { username: string; serialNo: number; upiId: string | null; price: number }) => {
//   try {
//     console.log("Creating Intent:", intentData);
//       const response = await axios.post(`${BASE_URL}/create`, intentData);
//       return `Intent Created: ${response.status}`;
//   } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//           console.error("Error creating intent:", error.response.data);
//       } else {
//           console.error("Error creating intent:", error);
//       }
//   }
// };

async function createIntent(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        const intentData = {          
            username: "user1",
            serialNo: 1,
            upiId: args.recipient,
            price: args.amount};
        const response = await axios.post(`${BASE_URL}/create`, intentData);
        return `Intent Created: ${response.status}`;
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}

async function getQuote(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        console.log(args.amount);
        //const serialNo = 1;
        const response = await axios.get(`http://localhost:3000/api/quote/getallquotes/1`);
        const result = response.data[0].price>response.data[1].price?response.data[1].price:response.data[0].price;
        console.log(result);
        return `Minimum proposed value for users intent is ${result} STRK`;
        // result.then((res: number) => {
        //     return `Minimum proposed value for users intent is ${res}`;
        // });
        // return "Error in fetching the minimum proposed value for users intent";
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}
async function transferToken(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        //await connectWallet();
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
            //setWallet(result.wallet)
            if (result.connectorData?.account) {
              //setAddress(result.connectorData.account)
            }
          }
        //setAddress(args.recipient);
        //setTransferAmount(args.amount);
        //if (!wallet || !recipientAddress || !transferAmount || !address) return "unable to transfer";
      
        //setLoading(true)
        try {
          const amountInWei = cairo.uint256(BigInt(Number.parseFloat(args.amount) * Math.pow(10, 18)))
      
          const calls = [
            {
              contract_address: ETH_ADDRESS,
              entry_point: "transfer",
              calldata: [args.recipient, amountInWei.low.toString(), amountInWei.high.toString()],
            },
          ]
      
          if (!result.wallet) {
            throw new Error("Wallet is not connected");
          }
          const result1 = await result.wallet.request({
            type: "wallet_addInvokeTransaction",
            params: { calls },
          })
      
          console.log("Transaction submitted:", result1.transaction_hash)
      
          const provider = new RpcProvider({ nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7" })
          await provider.waitForTransaction(result1.transaction_hash)
      
          console.log("Transaction completed!")
          return `Transaction completed! with transaction hash: ${result1.transaction_hash}`;
        } catch (error) {
          console.error("Transfer failed:", error)
          return "Transfer failed";
        } 
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}

async function getblockNumber(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        if (args.tokenName !== 'STRK' && args.tokenName !== 'STARKNET') {
            return `Sorry for now we only support starknet token`;
        }
        const response = await fetch('https://starknet-mainnet.blastapi.io/9eb9cf35-50ae-493c-84cf-247ac77524d5', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 0,
              method: 'starknet_blockNumber'
            })
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const data: ChainIdResponse = await response.json(); 
          return `Current Block number of ${args.tokenName} is ${data.result}`;
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}

async function getChainID(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        if (args.tokenName !== 'STRK' && args.tokenName !== 'STARKNET') {
            return `Sorry for now we only support starknet token`;
        }
        const response = await fetch('https://starknet-mainnet.blastapi.io/9eb9cf35-50ae-493c-84cf-247ac77524d5', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 0,
              method: 'starknet_chainId'
            })
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const data: ChainIdResponse = await response.json(); 
          return `Chain ID of ${args.tokenName} is ${data.result}`;
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}

async function getblockHashAndNumber(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        if (args.tokenName !== 'STRK' && args.tokenName !== 'STARKNET') {
            return `Sorry for now we only support starknet token`;
        }
        const response = await fetch('https://starknet-mainnet.blastapi.io/9eb9cf35-50ae-493c-84cf-247ac77524d5', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 0,
              method: 'starknet_blockHashAndNumber'
            })
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const data: ChainIdResponse = await response.json(); 
          if (typeof data.result === 'object' && 'block_hash' in data.result && 'block_number' in data.result) {
              return `Block hash of ${args.tokenName} is ${data.result.block_hash} and block number is ${data.result.block_number}`;
          } else {
              throw new Error("Invalid response format");
          }
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}

async function getTransactionByHash(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        // if (args.tokenName !== 'STRK' && args.tokenName !== 'STARKNET') {
        //     return `Sorry for now we only support starknet token`;
        // }
        console.log(args.transactionHash);
        const response = await fetch('https://starknet-mainnet.blastapi.io/9eb9cf35-50ae-493c-84cf-247ac77524d5', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 0,
              method: 'starknet_getTransactionByHash',
              params: [args.transactionHash]
            })
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const data: ChainIdResponse = await response.json(); 
          if (typeof data.result === 'object' && 'calldata' in data.result && 'max_fee' in data.result && 'nonce' in data.result && 'sender_address' in data.result && 'signature' in data.result && 'transaction_hash' in data.result && 'type' in data.result && 'version' in data.result) {
              return `Details of Transaction with hash ${args.transactionHash} are the following: Calldata = ${data.result.calldata}, Max Fee = ${data.result.nonce}, Nonce = ${data.result.nonce}, Sender Address = ${data.result.sender_address}, Signature = ${data.result.signature}, Transaction Hash = ${data.result.transaction_hash}, Type = ${data.result.type}, Version = ${data.result.version}`;
          } else {
              throw new Error("Invalid response format");
          }
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}

async function getTransactionReceipt(args: { tokenName: string, recipient: string, amount: string, transactionHash: string }): Promise<string> {
    try {
        // if (args.tokenName !== 'STRK' && args.tokenName !== 'STARKNET') {
        //     return `Sorry for now we only support starknet token`;
        // }
        const response = await fetch('https://starknet-mainnet.blastapi.io/9eb9cf35-50ae-493c-84cf-247ac77524d5', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 0,
              method: 'starknet_getTransactionReceipt',
              params: [args.transactionHash]
            })
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
    
          const data: ChainIdResponse = await response.json(); 
          if (typeof data.result === 'object' && 'actual_fee' in data.result&& 'events' in data.result&& 'execution_resources' in data.result&& 'execution_status' in data.result&& 'finality_status' in data.result && 'messages_sent' in data.result &&'transaction_hash' in data.result && 'type' in data.result) {
              return `Reciept of Transaction with hash ${args.transactionHash} contains the following details: Actual Fee = ${data.result.actual_fee}, Block Hash = ${data.result.block_hash}, Block Number = ${data.result.block_number}, Events = ${data.result.events}, Execution Resources = ${data.result.execution_resources}, Execution Status = ${data.result.execution_status}, Finality Status = ${data.result.finality_status}, Messages Sent = ${data.result.messages_sent}, Transaction Hash = ${data.result.transaction_hash}, Type = ${data.result.type}`;
          } else {
              throw new Error("Invalid response format");
          }
    } catch {
        console.log("error");
        return JSON.stringify({ error: "Invalid prompt" });
    }
}

export async function runConversation(prompt: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "You are a DeFi bot on Starknet and you can help users with activities like transferring tokens to others, sending the UPI key and amount to solver, get the minimum proposed value for users intent, If the user requests to send some token X to recipient Y for amount Z, call transferToken function to transfer token to another address. If the user asks to send the UPI key and amount to solvers then call createIntent function. If the user asks to get minimum proposed price of their intent then call getQuote function. Besides that, you can also chat with users and do some calculations if needed."
        },
        {
            role: "user",
            content: prompt,
        }
    ];

    const tools: ChatCompletionTool[] = [
        {
            type: "function",
            function: {
                name: "transferToken",
                description: "Transfer token X to recipient Y for amount Z. Use this if the user wants to transfer some token to another address.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "The name of the token that will be sent to other address. e.g. STRKBOT/USDC/STRK/ETH/STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "The address of the recipient starting with 0x.",
                        },
                        amount: {
                            type: "string",
                            description: "The amount of token to transfer.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value is always 0x.",
                        }
                    },
                    required: ["tokenName", "recipient", "amount"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "createIntent",
                description: "Send the UPI key and amount to solver. Use this if the user wants to send the UPI key and amount to solver.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "The name of the token that will be sent to other address. e.g. STRKBOT/USDC/STRK/ETH/STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "The UPI ID of the solver",
                        },
                        amount: {
                            type: "string",
                            description: "The amount to transfer.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value is always 0x.",
                        }
                    },
                    required: ["recipient", "amount"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getQuote",
                description: "Get the minimum proposed value for users intent. Use this if the user wants to get the minimum proposed value for users intent.Even if user hasn't provided the parameters assume anything of your own and call the function.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "its value will be always STARKNET. Even if user hasn't provided the parameters assume anything of your own and call the function.",
                        },
                        recipient: {
                            type: "string",
                            description: "Upi ID of user.Even if user hasn't provided the parameters assume anything of your own and call the function.",
                        },
                        amount: {
                            type: "string",
                            description: "Its value will be always 0.Even if user hasn't provided the parameters assume anything of your own and call the function.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "Its value will be always 0x.Even if user hasn't provided the parameters assume anything of your own and call the function.",
                        }
                    },
                    required: ["recipient"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getChainID",
                description: "Get the chainID of token X. Use this if the user wants to fetch the chainID of a token.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "We need the chainID of this token. e.g. STRKBOT/USDC/STRK/ETH/STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "Its value will be always 0x.",
                        },
                        amount: {
                            type: "string",
                            description: "Its value will be always 0.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value is always 0x.",
                        }
                    },
                    required: ["tokenName"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getblockNumber",
                description: "Get the block number of token X. Use this if the user wants to fetch the block number of a token.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "We need the block number of this token. e.g. STRKBOT/USDC/STRK/ETH/STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "Its value will be always 0x.",
                        },
                        amount: {
                            type: "string",
                            description: "Its value will be always 0.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value is always 0x.",
                        }
                    },
                    required: ["tokenName"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getblockHashAndNumber",
                description: "Get both block number and block hash of token X. Use this if the user wants to fetch the block number and block hash of a token.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "We need the block number of this token. e.g. STRKBOT/USDC/STRK/ETH/STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "Its value will be always 0x.",
                        },
                        amount: {
                            type: "string",
                            description: "Its value will be always 0.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value is always 0x.",
                        }
                    },
                    required: ["tokenName"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getblockHashAndNumber",
                description: "Get both block number and block hash of token X. Use this if the user wants to fetch the block number and block hash of a token.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "We need the block number of this token. e.g. STRKBOT/USDC/STRK/ETH/STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "Its value will be always 0x.",
                        },
                        amount: {
                            type: "string",
                            description: "Its value will be always 0.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value is always 0x.",
                        }
                    },
                    required: ["tokenName"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getTransactionByHash",
                description: "Get the details of a transaction by its hash. Use this if the user wants to fetch the details like calldata, Max Fee, Nonce, Sender Address, Signature, Transaction Hash, Type, Version of a transaction by its hash.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "The value is always STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "Its value will be always 0x.",
                        },
                        amount: {
                            type: "string",
                            description: "Its value will be always 0.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value starts with 0x.",
                        }
                    },
                    required: ["transactionHash"],
                },
            },
        },
        {
            type: "function",
            function: {
                name: "getTransactionReceipt",
                description: "Get the reciept of a transaction by its hash. Use this if the user wants to fetch the reciept of a transaction by its hash. Recipt contains details like Actual Fee, Block Hash, Block Number, Events, Execution Resources, Execution Status, Finality Status, Messages Sent, Transaction Hash, Type.",
                parameters: {
                    type: "object",
                    properties: {
                        tokenName: {
                            type: "string",
                            description: "The value is always STARKNET.",
                        },
                        recipient: {
                            type: "string",
                            description: "Its value will be always 0x.",
                        },
                        amount: {
                            type: "string",
                            description: "Its value will be always 0.",
                        },
                        transactionHash: {
                            type: "string",
                            description: "The value starts with 0x.",
                        }
                    },
                    required: ["transactionHash"],
                },
            },
        }                     
    ];

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: messages,
        stream: false,
        tools: tools,
        tool_choice: "auto",
        max_tokens: 4096
    });

    const responseMessage = response.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    console.log(toolCalls);

    if (toolCalls) {
        interface AvailableFunction {
            [key: string]: (args: { tokenName: string, recipient: string, amount: string, transactionHash: string}) => any;
        }

        // interface Message {
        //     tool_call_id?: string;
        //     role: string;
        //     name: string;
        //     content: string;
        // }

        const availableFunctions: AvailableFunction = {
            transferToken: transferToken,
            createIntent: createIntent,
            getQuote: getQuote,
            getChainID: getChainID,
            getblockNumber: getblockNumber,
            getblockHashAndNumber: getblockHashAndNumber,
            getTransactionByHash: getTransactionByHash,
            getTransactionReceipt: getTransactionReceipt,
        };

        
        messages.push(responseMessage);
        

        for (const toolCall of toolCalls) {
            const functionName = toolCall.function.name;
            const functionToCall = availableFunctions[functionName];
            const functionArgs = JSON.parse(toolCall.function.arguments);
            console.log(functionArgs);
            const functionResponse = await functionToCall({tokenName:functionArgs.tokenName, recipient:functionArgs.recipient, amount:functionArgs.amount, transactionHash:functionArgs.transactionHash});

            // Ensure the content is always a string
            const contentString = typeof functionResponse === 'string' ? functionResponse : JSON.stringify(functionResponse);
            // messages.push({
            //     tool_call_id: toolCall.id,
            //     role: "tool",
            //     name: functionName,
            //     content: contentString,
            // }as Message);

            messages.push({
                tool_call_id: toolCall.id,
                role: "function",
                name: functionName,
                content: contentString,
            } as ChatCompletionMessageParam);
        }

        const secondResponse = await client.chat.completions.create({
            model: MODEL,
            messages: messages
        });

        return secondResponse.choices[0].message.content ?? '';
    }

    return responseMessage.content ?? '';
}

