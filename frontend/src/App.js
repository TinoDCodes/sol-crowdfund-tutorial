import "./App.css";

import React, { useEffect, useState } from "react";

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    try {
      const { solana } = window;

      if (solana) {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());

        console.log("Connected with pubKey => ", response.publicKey.toString());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkWalletConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Please install Phantom wallet.");
      }
    } catch (error) {
      console.warn(
        "No wallet connected! You must connect a Phantom wallet to interact with the services on this site."
      );
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkWalletConnected();
    };

    onLoad();
  }, []);

  return (
    <div>
      {!walletAddress && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default App;
