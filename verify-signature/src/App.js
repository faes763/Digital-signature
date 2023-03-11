import './App.css';
import Web3 from "web3";
import MetaMaskOnboarding from '@metamask/onboarding';
import { useEffect, useState } from 'react';



function App() {
  const provider = new Web3(Web3.givenProvider);
  const web3 = new Web3(provider);

  const [message, setMessage] = useState("");
  const [singer, setSigner] = useState("");

  const [verifyAddress, setVerifyAddress] = useState("");
  const [verifyStatus, setVerifyStasus] = useState("");
  const [visibleVerify, setVisibleVerify] = useState(false);

  const [downloadMetamask, setDownloadMetamask] = useState(false);
  
  const [connectAccount, setConnectAccount] = useState(false);
  const [account, setAccount] = useState("");
  const [balance,setBalance] = useState("");

  async function loginAccount() {
    const {ethereum} = window;
    if(!ethereum && !ethereum.isMetaMask) {
      installMetamask();
      return;
    } else{
      const accounts = await ethereum.request({method:'eth_requestAccounts'});
      const account = accounts[0];
      const money = await ethereum.request({method: "eth_getBalance", params: [account, "latest"]});
      if(account) {setConnectAccount(true); setAccount(account)};
      await getBalance(money);
      return account; 
    }
  }
  
  async function getBalance(balance) {
    let wei = String(Number(balance));
    for(let i =wei.length; i < 19;i++) {wei = "0" + wei;}
    const ethBalance = await web3.utils.fromWei(wei,"ether");
    setBalance(`${ethBalance} ether`);
    console.log(web3)
  }

  function logout() {
    setConnectAccount(false);
    setAccount(null);
    setBalance(null);
  }
  
  async function verifySignature() {
    const actualAddress = await web3.eth.accounts.recover(message,singer);
    const valid = '0x8B3BE6aa20bA187BC082Aff21D9b8ab8DB592F86';
    setVerifyAddress(actualAddress);
    if(actualAddress !== valid) {
      console.log("bad");
      setVerifyStasus("False")
    }else {
      setVerifyStasus("True")
      console.log("valid")
    }
  }

  async function installMetamask() {
    const forwarderOrigin = "http://localhost:3000";
    const onboarding = new MetaMaskOnboarding({ forwarderOrigin });
    onboarding.startOnboarding();

  }


  async function sendMessage() {
    const msgParams = {
      domain: {
        name: "Ether",
        version: "1",
        chainId: 1,
      },
      primaryType: "Transfer",
      message: {
        from : account,
        contents: message,
      }
    }

    const typedDataHash = web3.utils.sha3(
      JSON.stringify(
        {
          domain: msgParams.domain,
          message: msgParams.message,
          primaryType: msgParams.primaryType,
          types: msgParams.types,
        }
      )
    );

    const method = 'eth_signTypedData_v4';

    // const signature = await web3.eth.personal.sign(typedDataHash, "0xa2955802829ACB5cab4A48CD4e0c7807d4C57fc8", {method});
    const signature = await web3.eth.personal.sign(typedDataHash,account, {method});
    setVisibleVerify(true);
    setSigner(signature);
  }

  useEffect(()=>{
    const {ethereum} = window;
    if(ethereum) {
      setDownloadMetamask(true);
    }else {
      setDownloadMetamask(false);
    }

  },[])

  return (
    <div className="App">
     
    {!downloadMetamask ? (
      <div >
        <button onClick={installMetamask}>Install Metamask</button>
      </div>
    ):(
      <div>
        <h1>Your account:<span>{account}</span></h1>
        <h2>Your Balance:<span>{balance}</span></h2>
        {connectAccount ? 
         (
          <div>
            <div>
              <div>
                <button onClick={logout}>Disconnect</button>
              </div>
              <input type="text" onChange={(e)=>{setMessage(e.target.value)}}/>
              <button onClick={sendMessage}>Отправить сообщение</button>
            </div>
            {visibleVerify? 
            (<div>
              <button onClick={verifySignature}>Check signature verify</button>
              <h2>VerifyStatus: {verifyStatus}</h2>
              <h2>Current Verify Address:</h2>
              <p>{verifyAddress}</p>
             </div>
            ) : (<></>)}
          </div>
         ) : 
         (
          <div>
            <button onClick={loginAccount}>Connect</button>
          </div>
         )
        }
      </div>
    )}
    </div>
  );
}

export default App;
