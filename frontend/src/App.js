import "./App.css";
import idl from "./idl.json";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, utils, BN } from "@coral-xyz/anchor";
import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { Button } from "@mui/material";

window.Buffer = Buffer;

const PROGRAM_ID = new PublicKey(idl.address);
const NETWORK = clusterApiUrl("devnet");
/** How we acknowledge that a transaction is done. "processed" means that we wait only until the node we are connected to has confirmed the transaction. */
const opts = {
  preflightCommitment: "processed",
};

const { SystemProgram } = web3;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

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

  /**
   * This method creates a provider, which is an authenticated connection to Solana.
   *
   * @returns {AnchorProvider}
   */
  const getProvider = () => {
    const connection = new Connection(NETWORK, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );

    return provider;
  };

  const createCampaign = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, provider);

      const [campaign] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.rpc.create(
        "Save Africa",
        "Donate to help save starving kids and families in africa.",
        {
          accounts: {
            campaign,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
        }
      );

      console.log("Created a new campaign with address: ", campaign.toString());
    } catch (error) {
      console.error("Failed to create campaign!", error);
    }
  };

  const getAllCampaigns = async () => {
    const connection = new Connection(NETWORK, opts.preflightCommitment);
    const provider = getProvider();
    const program = new Program(idl, provider);

    Promise.all(
      (await connection.getProgramAccounts(PROGRAM_ID)).map(
        async (campaign) => ({
          ...(await program.account.campaign.fetch(campaign.pubkey)),
          pubkey: campaign.pubkey,
        })
      )
    ).then((campaigns) => {
      setCampaigns(campaigns);
      console.log("done fetching", campaigns);
    });
  };

  const donate = async (publickey) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, provider);

      await program.rpc.donate(new BN(0.2 * LAMPORTS_PER_SOL), {
        accounts: {
          campaign: publickey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });

      console.log("Successfully donated to campaign: ", publickey);
      getAllCampaigns();
    } catch (error) {
      console.error("Failed to donate!", error);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkWalletConnected();
    };

    onLoad();
  }, []);

  return (
    <main className="app">
      <header className="header">
        <h3 className="logo">MyCrowdFund</h3>
        {!walletAddress && (
          <Button
            className="connect-btn"
            color="secondary"
            variant="contained"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        )}
      </header>

      <section className="app-content">
        <div className="campaign-list">
          {campaigns.map((campaign) => (
            <article className="campaign-item" key={campaign.pubkey.toString()}>
              <div>
                <h3>{campaign.name}</h3>
                <p>{campaign.description}</p>
                <h4>
                  Balance:{" "}
                  <strong>
                    {(campaign.amountDonated / LAMPORTS_PER_SOL).toString()} SOL
                  </strong>
                </h4>
              </div>

              <Button
                variant="contained"
                color="success"
                className="donate-btn"
                onClick={() => donate(campaign.pubkey)}
              >
                Donate
              </Button>
            </article>
          ))}
        </div>

        <div className="actions">
          <Button
            color="success"
            variant="outlined"
            disabled={!walletAddress}
            onClick={createCampaign}
          >
            Create New Campaign
          </Button>

          <Button
            color="inherit"
            variant="outlined"
            disabled={!walletAddress}
            onClick={getAllCampaigns}
          >
            Load Campaigns
          </Button>
        </div>
      </section>
    </main>
  );
};

export default App;
