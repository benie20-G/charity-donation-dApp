import React, { useEffect, useState } from 'react';
import './App.css';
import Web3 from 'web3';
import CharityDonation from './contracts/CharityDonation.json';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [donationAmount, setDonationAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const web3 = new Web3(window.ethereum);
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
       
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          // Get user accounts
          const accounts = await web3.eth.getAccounts();
          

          // Check if the specific account is in the user's MetaMask accounts
          const specifiedAccount = '0xF7eeA30d37050F6C80E8e05263648620A1309Ede';
          if (accounts.includes(specifiedAccount)) {
            setAccount(specifiedAccount);
          } else {
            alert(`Please connect with the account: ${specifiedAccount}`);
            return;
          }

          // Get network ID
          const networkId = await web3.eth.net.getId();
          const networkData = CharityDonation.networks[networkId];
          
          if (networkData) {
            const charityDonation = new web3.eth.Contract(CharityDonation.abi, networkData.address);
            console.log(charityDonation)
           
            
            setContract(charityDonation);
           
            // Get contract balance
            const balance = await web3.eth.getBalance(specifiedAccount);
            console.log(balance)
         
            setBalance(web3.utils.fromWei(balance, 'ether'));
          } else {
            alert('CharityDonation contract not deployed to detected network.');
          }
        } catch (error) {
          console.error('Error loading blockchain data:', error);
        }
      } else {
        alert('Please install MetaMask!');
      }
    };

    loadBlockchainData();
  }, []);

  const handleDonate = async () => {
    if (contract) {
      setLoading(true);
      setMessage('');
      try {
        await contract.methods.donate().send({ from: account, value: Web3.utils.toWei(donationAmount, 'ether') });
        console.log("--finished sending the eth")
        const balance = await web3.eth.getBalance(account);
        setBalance(Web3.utils.fromWei(balance, 'ether'));
        setDonationAmount('');
        setMessage('Donation successful!');
      } catch (error) {
        console.error('Error making donation:', error);
        setMessage('Donation failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Charity Donation DApp</h1>
      <p>Account: {account}</p>
      <p>Contract Balance: {balance} ETH</p>
      <input
        type="text"
        placeholder="Donation amount in ETH"
        value={donationAmount}
        onChange={(e) => setDonationAmount(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleDonate} disabled={loading || !donationAmount}>
        {loading ? 'Processing...' : 'Donate'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
