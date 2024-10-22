import Head from "next/head";
import Navbar from "../components/Navbar";
import { useState } from "react";
import Footer from "../components/Footer";
import Catson from "../images/catson.png";

// Sidebar Components
import TokenStats from "../components/TokenStats";
import ActionsCard from "../components/ActionCard";
import LinksCard from "../components/LinkCard";

import {
    Box,
    Grid,
    Typography,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // For copy icon
import Image from "next/image"; // For handling images/icons
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const tokenAddress = "0xcA8e8d244f0d219a6Fc9e4793C635cEA98d0399C";

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(tokenAddress);
        toast.success("Token address copied!");
    };

    return (
        <>
            <Head>
                <title>CoinBoom</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                {/* Navbar */}
                <ToastContainer />
                <Navbar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />

                <div className="min-h-screen bg-gray-800 py-16 text-white">
                    <div className=" mx-auto pt-16 pb-8 px-4">
                        <Grid container spacing={4}>
                            {/* Left Sidebar / Main Chart Section */}
                            <Grid item xs={12} md={8}>
                                <Box className="p-4 rounded-lg shadow-lg">
                                    {/* Coin Header Section */}
                                    <Box className="flex items-center mb-4">
                                        {/* Coin Icon */}
                                        <Box className="mr-2">
                                            <Image
                                                src={Catson} // Update this with the correct path to the coin icon
                                                alt="Coin Icon"
                                                width={70}
                                                height={70}
                                                className="rounded-[50%] "
                                            />
                                        </Box>
                                        {/* Coin Name and Contract */}
                                        <Box>
                                            <Typography
                                                variant="h4"
                                                gutterBottom
                                            >
                                                Catson (CAT){" "}
                                                {/* Coin name and symbol */}
                                            </Typography>
                                            <Box className="flex items-center">
                                                <Typography
                                                    variant="body1"
                                                    className="mr-2"
                                                >
                                                    {tokenAddress}{" "}
                                                    {/* Token contract address */}
                                                </Typography>
                                                <Tooltip title="Copy Address">
                                                    <IconButton
                                                        onClick={
                                                            handleCopyAddress
                                                        }
                                                        color="primary"
                                                    >
                                                        <ContentCopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* DexScreener Chart */}

                                    {/* Transaction Table */}
                                </Box>
                            </Grid>

                            {/* Right Sidebar */}
                            <Grid item xs={12} md={4}>
                                <ActionsCard />
                                {/* <TokenStats /> */}
                                {/* <LinksCard /> */}
                            </Grid>
                        </Grid>
                    </div>

                    <Box className="bg-gray-900 min-h-screen p-4 rounded-lg w-full">
                        <iframe
                            src="https://dexscreener.com/base/0xCCa1c5F774B79de7eFe9C20D0Eb6cbF29Ac57155?embed=1&theme=dark"
                            width="100%"
                            style={{
                                border: "none",
                                borderRadius: "8px",
                                minHeight: "150vh",
                            }}
                            allow="clipboard-write"
                            allowFullScreen
                        ></iframe>
                    </Box>
                </div>

                <div
                    className={`transition-all duration-300 ${
                        isSidebarOpen ? "md:ml-64" : "ml-0"
                    }`}
                >
                    <Footer />
                </div>
            </main>
        </>
    );
}