import React, { useState } from "react";
import axios from "axios";

const Solver2Page: React.FC = () => {
  // State to store the result
  const [result, setResult] = useState<string>("");
    // State to store form submission result
    const [formResult, setFormResult] = useState<string>("");

    // State to manage form inputs
    const [formData, setFormData] = useState<{ name: string; age: number }>({
      name: "",
      age: 0,
    });

  const BASE_URL = "http://localhost:3000/api/intent"; // Replace with your server's base URL

  // 3. Create a New Intent (POST with Body)
  const getIntent = async (serialNo: number) => {
    try {
      //console.log("Creating Intent:", intentData);
        const response = await axios.get(`${BASE_URL}/getintent/${serialNo}`);
        console.log("Intent Created:", response.data);
        return JSON.stringify(response.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error creating intent:", error.response.data);
        } else {
            console.error("Error creating intent:", error);
        }
    }
  };
  
  const createQuote = async (quoteData: { serialNo: number; walletAddress: string | null; price: number }) => {
    try {
        const response = await axios.post(`http://localhost:3000/api/quote/create`, quoteData);
        console.log("Intent Created:", response.status);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error creating intent:", error.response.data);
        } else {
            console.error("Error creating intent:", error);
        }
    }
  };

  // Function to handle button click
  const handleClick = async () => {
    const serialNo = 1; // Replace with the actual serial number you want to use
    const newResult = await getIntent(serialNo); // Your logic can go here
    setResult(newResult || ""); // Update the result state
  };

    // Function to handle form submission
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent page reload
        console.log("Form Data:", formData); // You can use this data as needed
        const response = await createQuote({serialNo: 1, walletAddress: formData.name, price: formData.age});
        console.log(response);
        setFormResult("Success");
      };
    
      // Function to handle form input changes
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: name === "age" ? parseInt(value) || 0 : value,
        }));
      };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* Button and Output */}
      <button onClick={handleClick} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Get Intent
      </button>
      {/* Display the result below the button */}
      {result && <p style={{ marginTop: "20px", fontSize: "18px", color: "blue" }}>{result}</p>}
   

      {/* Form */}
      <form onSubmit={handleFormSubmit} style={{ marginTop: "30px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Wallet Address (String):
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{ marginLeft: "10px", padding: "5px", fontSize: "16px" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Amount (Number):
            <input
              type="number"
              name="age"
              value={formData.age || ""}
              onChange={handleInputChange}
              style={{ marginLeft: "10px", padding: "5px", fontSize: "16px" }}
            />
          </label>
        </div>
        <button type="submit" style={{ padding: "10px 20px", fontSize: "16px" }}>
          Submit
        </button>
      </form>

      {/* Form Submission Result */}
      {formResult && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>{formResult}</p>
      )}
    </div>
  );
};

export default Solver2Page;
