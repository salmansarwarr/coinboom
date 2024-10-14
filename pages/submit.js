import Head from "next/head";
import Navbar from "../components/Navbar";
import { useState } from "react";
import CoinsTable from "../components/Table";
import TrendingNavigation from "../components/TrendingNavigation";
import binanceIcon from "../images/binance.png";
import etheruemIcon from "../images/ethereum.png";
import solanaIcon from "../images/solana.png";
import Image from "next/image";
import SubmitCoinForm from "../components/SubmitCoinForm";
import Footer from "../components/Footer";


export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
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
                <Navbar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
                <div
                    className={`min-h-screen bg-black text-white p-6 pt-20 transition-all duration-300 ${
                        isSidebarOpen ? "ml-64" : "ml-0"
                    }`}
                >
                    <SubmitCoinForm/>
                </div>
            </main>
            <div
                className={` transition-all duration-300 ${
                    isSidebarOpen ? "ml-64" : "ml-0"
                }`}
            >
                <Footer />
            </div>
        </>
    );
}