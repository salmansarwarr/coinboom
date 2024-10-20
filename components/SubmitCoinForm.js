import React, { useState } from "react";
import {
    Stepper,
    Step,
    StepLabel,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
    Input,
    CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Image from "next/image";

const steps = ["Project Information", "Links", "Listing"];

const SubmitCoinForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        blockchain: "BSC",
        contractAddress: "0xB8c76482f45A0F44dE1545F52C73426C621bDC52",
        name: "Bitcoin",
        symbol: "BTC",
        description: "",
        isPresale: "No",
        launchDate: "",
        presaleUrl: "",
    });

    const handleNext = async () => {
        if (activeStep === 0) {
            setLoading(true);
            // Ensure all required fields are filled
            if (!validateForm()) {
                setLoading(false);
                alert("Please fill all required fields.");
                return;
            }

            // Validate contract address on the selected blockchain
            const isValidContract = await validateContractAddress();
            if (!isValidContract) {
                setLoading(false);
                alert("Invalid contract address for the selected blockchain.");
                return;
            }

            // Check if the coin already exists in the database
            const isCoinExists = await checkCoinExists();
            if (isCoinExists) {
                setLoading(false);
                alert("This coin already exists in the database.");
                return;
            }

            setLoading(false);
        }
        // Proceed to the next step if validations pass
        if (activeStep === 2) {
            await handleSubmit();
            return;
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    // Helper function to validate required fields
    const validateForm = () => {
        const requiredFields = [
            "contractAddress",
            "name",
            "symbol",
            "blockchain",
            "description",
            ...(formData.isPresale === "Yes"
                ? ["launchDate", "presaleUrl"]
                : []),
        ];
        return requiredFields.every((field) => formData[field]);
    };

    const validateContractAddress = async () => {
        const { blockchain, contractAddress } = formData;
        try {
            let isValid = false;

            switch (blockchain) {
                case "BSC":
                case "ETH":
                case "arbitrum":
                case "polygon":
                    isValid = await validateEVMAddress(
                        contractAddress,
                        blockchain
                    );
                    break;
                case "SOL":
                    isValid = validateSolanaAddress(contractAddress);
                    break;
                case "tron":
                    isValid = validateTronAddress(contractAddress);
                    break;
                default:
                    console.warn("Unsupported blockchain");
            }
            return isValid;
        } catch (error) {
            console.error("Error validating contract address:", error);
            return false;
        }
    };

    // Helper function to validate Ethereum-compatible (EVM) addresses
    const validateEVMAddress = async (address, blockchain) => {
        const Web3 = require("web3");
        const rpcUrls = {
            BSC: "https://bsc-dataseed.binance.org/",
            ETH: "https://mainnet.infura.io/v3/1ec4ddbe38074cb8afb3bc22c1cb8689",
            arbitrum: "https://arb1.arbitrum.io/rpc",
            polygon: "https://polygon-rpc.com/",
        };

        return Web3.utils.isAddress(address);
    };

    // Helper function to validate Solana addresses
    const validateSolanaAddress = (address) => {
        const { PublicKey } = require("@solana/web3.js");
        try {
            new PublicKey(address); // Will throw an error if invalid
            return true;
        } catch {
            return false;
        }
    };

    // Helper function to validate Tron addresses
    const validateTronAddress = (address) => {
        const TronWeb = require("tronweb");
        const tronWeb = new TronWeb({
            fullHost: "https://api.trongrid.io",
        });
        return tronWeb.isAddress(address);
    };

    // Check if the coin already exists in the database
    const checkCoinExists = async () => {
        try {
            const res = await fetch(
                `/api/check-coin?address=${formData.contractAddress}`
            );
            const data = await res.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking coin existence:", error);
            return false;
        }
    };

    const handleImageChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleSubmit = async () => {
        // Create a new FormData object
        const formDataToSubmit = new FormData();

        // Append all fields from the formData object
        Object.keys(formData).forEach((key) => {
            formDataToSubmit.append(key, formData[key]);
        });

        // Check if a file is selected and append it
        if (selectedFile) {
            formDataToSubmit.append("image", selectedFile);
        } else {
            console.warn("No image file selected"); // Warning if no file is selected
        }

        try {
            // Make a POST request to the API endpoint
            const res = await fetch("/api/submit-coin", {
                method: "POST",
                body: formDataToSubmit,
            });

            // Parse the JSON response
            const data = await res.json();

            if (res.ok) {
                console.log("Form submitted successfully:", data);
                // Optionally, reset form fields or provide user feedback
            } else {
                console.error(
                    "Error submitting form:",
                    data.error || "Unknown error"
                );
                // Optionally, display an error message to the user
            }
        } catch (error) {
            console.error("Network error:", error); // Catch network errors
        }
    };

    const renderFieldStatus = (fieldName) => {
        if (formData[fieldName]) {
            return (
                <CheckCircleIcon
                    className="text-green-500 ml-2"
                    fontSize="small"
                />
            );
        }
        return <span className="text-red-500 ml-2 text-sm">Required</span>;
    };

    const renderFileStatus = () => {
        if (selectedFile) {
            return (
                <CheckCircleIcon
                    className="text-green-500 ml-2"
                    fontSize="small"
                />
            );
        }
        return <span className="text-red-500 ml-2 text-sm">Required</span>;
    };

    return (
        <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg">
            <Typography
                variant="h4"
                className="text-blue-500 font-bold text-center mb-8"
            >
                Submit Coin
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel className="mb-12">
                {steps.map((label, index) => (
                    <Step key={index}>
                        <StepLabel>
                            <span className="text-blue-500 font-bold">
                                {index + 1}.
                            </span>{" "}
                            <span className="text-white">{label}</span>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <div className="mt-8">
                {activeStep === 0 && (
                    <div
                        className={`grid grid-cols-1 ${
                            !loading && "md:grid-cols-3"
                        } gap-8`}
                    >
                        {loading ? (
                            <div className="w-full h-full bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
                                <CircularProgress
                                    size={60}
                                    className="text-white"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Left Section: Logo Upload */}
                                <div className="md:col-span-1 flex flex-col items-center">
                                    <div className="flex flex-col bg-gray-800 p-6 rounded-lg w-full">
                                        <Typography
                                            variant="body1"
                                            className="text-white mb-4"
                                        >
                                            Upload logo{" "}
                                            <span className="text-blue-500">
                                                *
                                            </span>
                                            {renderFileStatus()}
                                        </Typography>
                                        <div className="w-full aspect-square flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg mb-4">
                                            {selectedFile ? (
                                                <Image
                                                    alt="logo"
                                                    width={512}
                                                    height={512}
                                                    src={URL.createObjectURL(
                                                        selectedFile
                                                    )}
                                                />
                                            ) : (
                                                <Typography
                                                    variant="h2"
                                                    className="text-gray-400"
                                                >
                                                    ?
                                                </Typography>
                                            )}
                                        </div>
                                        <Input
                                            accept="image/*"
                                            id="logo-upload"
                                            type="file"
                                            onChange={handleImageChange.bind(
                                                this
                                            )}
                                            variant="contained"
                                            className="bg-blue-600 hover:bg-blue-700 text-white mb-4"
                                        >
                                            Upload
                                        </Input>
                                        <Typography
                                            variant="caption"
                                            className="text-gray-400 text-center"
                                        >
                                            Optimal dimensions 512×512px, size
                                            up to 1MB
                                        </Typography>
                                    </div>
                                </div>

                                {/* Right Section: Form Fields */}
                                <div className="md:col-span-2">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormControl fullWidth>
                                                <Typography
                                                    variant="body2"
                                                    className="text-white mb-2 flex items-center"
                                                >
                                                    Blockchain
                                                    {renderFieldStatus(
                                                        "blockchain"
                                                    )}
                                                </Typography>
                                                <Select
                                                    value={formData.blockchain}
                                                    name="blockchain"
                                                    onChange={handleChange}
                                                    displayEmpty
                                                    className="bg-gray-800 text-white border border-gray-700 rounded-md"
                                                >
                                                    <MenuItem value="BSC">
                                                        Binance Smart Chain
                                                        (BSC)
                                                    </MenuItem>
                                                    <MenuItem value="ETH">
                                                        Ethereum (ETH)
                                                    </MenuItem>
                                                    <MenuItem value="SOL">
                                                        Solana (SOL)
                                                    </MenuItem>
                                                    <MenuItem value="arbitrum">
                                                        Arbitrum
                                                    </MenuItem>
                                                    <MenuItem value="polygon">
                                                        Polygon (MATIC)
                                                    </MenuItem>
                                                    <MenuItem value="tron">
                                                        Tron
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>

                                            <FormControl fullWidth>
                                                <Typography
                                                    variant="body2"
                                                    className="text-white mb-2 flex items-center"
                                                >
                                                    Contract Address
                                                    {renderFieldStatus(
                                                        "contractAddress"
                                                    )}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    name="contractAddress"
                                                    value={
                                                        formData.contractAddress
                                                    }
                                                    onChange={handleChange}
                                                    className="bg-gray-800"
                                                    InputProps={{
                                                        className: "text-white",
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormControl fullWidth>
                                                <Typography
                                                    variant="body2"
                                                    className="text-white mb-2 flex items-center"
                                                >
                                                    Name
                                                    {renderFieldStatus("name")}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="bg-gray-800"
                                                    InputProps={{
                                                        className: "text-white",
                                                    }}
                                                />
                                            </FormControl>
                                            <FormControl fullWidth>
                                                <Typography
                                                    variant="body2"
                                                    className="text-white mb-2 flex items-center"
                                                >
                                                    Symbol
                                                    {renderFieldStatus(
                                                        "symbol"
                                                    )}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    name="symbol"
                                                    value={formData.symbol}
                                                    onChange={handleChange}
                                                    className="bg-gray-800"
                                                    InputProps={{
                                                        className: "text-white",
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormControl fullWidth>
                                            <Typography
                                                variant="body2"
                                                className="text-white mb-2 flex items-center"
                                            >
                                                Description
                                                {renderFieldStatus(
                                                    "description"
                                                )}
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                multiline
                                                rows={4}
                                                className="bg-gray-800"
                                                InputProps={{
                                                    className: "text-white",
                                                }}
                                            />
                                        </FormControl>
                                        <div>
                                            <Typography
                                                variant="body2"
                                                className="text-white mb-2 flex items-center"
                                            >
                                                Is this a
                                                Presale/PumpFun/Moonshot
                                                Project?
                                                {renderFieldStatus("isPresale")}
                                            </Typography>
                                            <RadioGroup
                                                row
                                                name="isPresale"
                                                value={formData.isPresale}
                                                onChange={handleChange}
                                            >
                                                <FormControlLabel
                                                    value="Yes"
                                                    control={
                                                        <Radio
                                                            sx={{
                                                                color: "#3B82F6",
                                                                "&.Mui-checked":
                                                                    {
                                                                        color: "#3B82F6",
                                                                    },
                                                            }}
                                                        />
                                                    }
                                                    label="Yes"
                                                    className="text-white"
                                                />
                                                <FormControlLabel
                                                    value="No"
                                                    control={
                                                        <Radio
                                                            sx={{
                                                                color: "#3B82F6",
                                                                "&.Mui-checked":
                                                                    {
                                                                        color: "#3B82F6",
                                                                    },
                                                            }}
                                                        />
                                                    }
                                                    label="No"
                                                    className="text-white"
                                                />
                                            </RadioGroup>
                                        </div>

                                        {formData.isPresale === "Yes" && (
                                            <>
                                                <div className="mb-4">
                                                    <Typography
                                                        variant="body2"
                                                        className="text-white mb-2 flex items-center"
                                                    >
                                                        Launch Date
                                                        {renderFieldStatus(
                                                            "launchDate"
                                                        )}
                                                    </Typography>
                                                    <input
                                                        type="date"
                                                        name="launchDate"
                                                        value={
                                                            formData.launchDate
                                                        }
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2"
                                                    />
                                                </div>

                                                <div className="mb4">
                                                    <Typography
                                                        variant="body2"
                                                        className="text-white mb2 flex items-center"
                                                    >
                                                        Presale (Pinksale,
                                                        PumpFun, Moonshot etc.)
                                                        URL
                                                        {renderFieldStatus(
                                                            "presaleUrl"
                                                        )}
                                                    </Typography>

                                                    <TextField
                                                        fullWidth
                                                        name="presaleUrl"
                                                        value={
                                                            formData.presaleUrl
                                                        }
                                                        onChange={handleChange}
                                                        className="bg-gray800"
                                                        InputProps={{
                                                            classNames:
                                                                "textwhite",
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeStep === 1 && (
                    <div className="grid grid-cols-3 gap-6">
                        {/* Left Section: Logo Display */}
                        <div className="col-span-1 flex flex-col items-center">
                            <div className="bg-gray-800 p-4 rounded-full transition-transform duration-300 hover:scale-105">
                                <Image
                                    height={30}
                                    width={30}
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Tron Logo"
                                    className="w-40 h-40 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Right Section: Links */}
                        <div className="col-span-2">
                            <div className="space-y-4">
                                {[
                                    "website",
                                    "telegram",
                                    "twitter",
                                    "discord",
                                    "facebook",
                                    "reddit",
                                    "linktree",
                                ].map((field) => (
                                    <TextField
                                        key={field}
                                        fullWidth
                                        label={`${
                                            field.charAt(0).toUpperCase() +
                                            field.slice(1)
                                        } link`}
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        placeholder={`https://your${field}.com/`}
                                        className="bg-gray-800 text-white border border-gray-700 rounded-md hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                                        InputLabelProps={{
                                            className: "text-gray-400",
                                        }}
                                        InputProps={{
                                            style: { color: "white" },
                                            placeholder: `Enter your ${field} link`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeStep === 2 && (
                    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                                <Image
                                    className="w-8 h-8"
                                    src={URL.createObjectURL(selectedFile)}
                                    height={100}
                                    width={100}
                                    alt="coin"
                                >
                                    {/* <!-- Add your TRX icon SVG path here --> */}
                                </Image>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {formData.name}
                                </h2>
                                <p className="text-gray-400">
                                    {formData.symbol}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-400">
                                Contract ({formData.blockchain})
                            </p>
                            <p className="text-sm truncate">
                                {formData.contractAddress}
                            </p>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-400">Description</p>
                            <p>{formData.description}</p>
                        </div>

                        {/* 
                        <div className="mb-6">
                            <h3 className="font-bold mb-2">
                                Choose Your Listing Option:
                            </h3>
                            <div className="flex space-x-4">
                                
                                <label
                                    className={`flex items-center cursor-pointer bg-yellow-900 border border-yellow-600 rounded-lg p-4 transition-transform duration-300 ${
                                        selectedOption === "free"
                                            ? "bg-yellow-600"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="listingOption"
                                        value="free"
                                        checked={selectedOption === "free"}
                                        onChange={handleOptionChange}
                                        className="hidden"
                                    />
                                    <span
                                        className={`mr-2 rounded-full w-4 h-4 border border-yellow-500 ${
                                            selectedOption === "free"
                                                ? "bg-yellow-600"
                                                : ""
                                        }`}
                                    ></span>
                                    Free Listing
                                </label>

                                <label
                                    className={`flex items-center cursor-pointer bg-yellow-900 border border-yellow-600 rounded-lg p-4 transition-transform duration-300 ${
                                        selectedOption === "express"
                                            ? "bg-yellow-600"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="listingOption"
                                        value="express"
                                        checked={selectedOption === "express"}
                                        onChange={handleOptionChange}
                                        className="hidden"
                                    />
                                    <span
                                        className={`mr-2 rounded-full w-4 h-4 border border-yellow-500 ${
                                            selectedOption === "express"
                                                ? "bg-yellow-600"
                                                : ""
                                        }`}
                                    ></span>
                                    Express Listing
                                </label>
                            </div>
                        </div>
                        
                        */}

                        {/* Free Listing Details */}
                        {/* {selectedOption === "free" && (
                            <div id="free-listing-info" className="mb-6">
                                <h3 className="font-bold mb-2">
                                    Free Listing:
                                </h3>
                                <p>
                                    Your review request will be reviewed by our
                                    review team and will be accepted within 24
                                    hours at the latest. If you have any
                                    questions, please feel free to contact us.
                                </p>
                            </div>
                        )} */}

                        {/* Express Listing Details */}
                        {/* {selectedOption === "express" && (
                            <div id="express-listing-info" className="mb-6">
                                <h3 className="font-bold mb-2">
                                    Express Listing:
                                </h3>
                                <p>
                                    Your token is instantly listed on the
                                    coinboom.net platform in a few minutes after
                                    you complete the crypto payment.
                                </p>
                                <p className="font-bold mb-2">
                                    Additional benefits of Express Listing:
                                </p>
                                <ul className="list-disc list-inside text-sm">
                                    <li>
                                        Your token gets listed instantly,
                                        skipping the queue. Be seen right away!
                                    </li>
                                    <li>
                                        +500 Votes and 125 Promoted Listings
                                    </li>
                                </ul>
                                <p className="font-bold mt-4 mb-2">
                                    Multiple Crypto Payment options:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                                        <span>0.2 BNB</span>
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-4 h-4 bg-blue-300 rounded-full mr-2"></div>
                                        <span>0.003 ETH</span>
                                    </li>
                                    <li className="flex items-center">
                                        <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
                                        <span>0.3 SOL</span>
                                    </li>
                                </ul>
                            </div>
                        )} */}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12">
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2"
                    >
                        <span className="text-white">Back</span>
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="bg-blue-500 hover:bg-blue-600 text-black px-6 py-2"
                    >
                        {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SubmitCoinForm;
