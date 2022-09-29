import { useState, useEffect } from "react";
import Web3 from "web3";
import MetamaskLogo from "./assets/metamask.svg";
import Cookies from "js-cookie";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [uniqueId, setUniqueId] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);

  const acceptedTermsFunc = () => {
    setAcceptedTerms(!acceptedTerms);
    if (acceptedTerms) {
      setButtonActive(false);
    } else {
      setButtonActive(true);
      getUserId5();
    }
  };

  function getUserId5() {
    const userId = Cookies.get("_pbjs_userid_consent_data");
    setUniqueId(userId);
    console.log("userId: ", userId);
  }

  useEffect(() => {
    function checkConnectedWallet() {
      const userData = JSON.parse(localStorage.getItem("userAccount"));
      if (userData != null) {
        setUserInfo(userData);
        setIsConnected(true);
      }
    }
    checkConnectedWallet();
  }, []);

  const detectCurrentProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      // eslint-disable-next-line
      provider = window.web3.currentProvider;
    } else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
    return provider;
  };

  const onConnect = async () => {
    try {
      const currentProvider = detectCurrentProvider();
      if (currentProvider) {
        if (currentProvider !== window.ethereum) {
          console.log(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        }
        await currentProvider.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(currentProvider);
        const userAccount = await web3.eth.getAccounts();
        const chainId = await web3.eth.getChainId();
        const account = userAccount[0];
        let ethBalance = await web3.eth.getBalance(account); // Get wallet balance
        ethBalance = web3.utils.fromWei(ethBalance, "ether"); //Convert balance to wei
        // Get user transaction history
        const transactionHistory = await web3.eth
          .getTransactionCount(account)
          .then((txCount) => {
            const txHistory = [];
            for (let i = 0; i < txCount; i++) {
              web3.eth.getTransactionFromBlock(account, i).then((tx) => {
                txHistory.push(tx);
                console.log(txHistory);
              });
            }
            return txHistory;
          });
        console.log("Transaction History: " + transactionHistory);
        saveUserInfo(
          ethBalance,
          account,
          chainId,
          transactionHistory,
          uniqueId
        );
        if (userAccount.length === 0) {
          console.log("Please connect to meta mask");
        }
      }
    } catch (err) {
      console.log(err);
      console.log(
        "There was an error fetching your accounts. Make sure your Ethereum client is configured correctly."
      );
    }
  };

  const onDisconnect = () => {
    window.localStorage.removeItem("userAccount");
    setUserInfo({});
    setIsConnected(false);
  };

  const saveUserInfo = (
    ethBalance,
    account,
    chainId,
    transactionHistory,
    userId
  ) => {
    const userAccount = {
      account: account,
      balance: ethBalance,
      transactionHistory: transactionHistory,
      connectionid: chainId,
      userId: userId,
    };
    window.localStorage.setItem("userAccount", JSON.stringify(userAccount)); //user persisted data
    const userData = JSON.parse(localStorage.getItem("userAccount"));
    setUserInfo(userData);
    setIsConnected(true);
    saveDataOnFirebase(userData);
  };

  const saveDataOnFirebase = async (data) => {
    // Save user Id and wallet address on firebase
    try {
      const docRef = await addDoc(collection(db, "users"), {
        userId: data.userId,
        walletAddress: data.account,
      });
      console.log("Document written with ID: ", docRef);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Metamask & Firebase</h1>
      </div>
      <div className="app-wrapper">
        {!isConnected && (
          <div>
            <img src={MetamaskLogo} alt="meta mask logo" />
            <br />
            <label>
              <input
                className="terms-checkbox"
                type="checkbox"
                checked={acceptedTerms}
                onChange={acceptedTermsFunc}
              />
              <a>Accept terms and conditions</a>
            </label>
            <br />
            <button
              style={{
                opacity: buttonActive ? 1 : 0.5,
                width: "100%",
                marginTop: "10px",
              }}
              className="connect-button"
              onClick={onConnect}
              disabled={!buttonActive}
            >
              {"Connect"}
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="app-wrapper">
          <div className="app-details">
            <h2>✅ You are connected to metamask.</h2>
            <div className="app-account">
              <span>Account Address:</span>
              {userInfo.account}
            </div>
            <div className="app-unique-id">
              <span>Unique id:</span>
              {uniqueId}
            </div>
            {userInfo.transactionHistory.length ? (
              <div className="app-history">
                <span>Transaction history:</span>
                {userInfo.transactionHistory}
              </div>
            ) : (
              <div className="app-history">
                <span>Transaction history:</span>
                No transaction history
              </div>
            )}
            <div className="app-balance">
              <span>Balance:</span>
              {userInfo.balance}
            </div>
            <div className="app-connectionid">
              <span>Connection ID:</span>
              {userInfo.connectionid}
            </div>
          </div>
          <div>
            <button className="app-buttons__logout" onClick={onDisconnect}>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
