import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Buffer } from 'buffer';
import ipfs from './ipfs';
import FileStorage from './contracts/FileStorage.json';
import './App.css';  // Import the CSS file

const App = () => {
  const [account, setAccount] = useState('');
  const [fileStorage, setFileStorage] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [files, setFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadBlockchainData();
    }
  }, [isConnected]);

  const loadBlockchainData = async () => {
    try {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const networkData = FileStorage.networks[networkId];

      if (networkData) {
        const fileStorage = new web3.eth.Contract(FileStorage.abi, networkData.address);
        setFileStorage(fileStorage);
        const fileCount = await fileStorage.methods.fileCount().call();
        let filesArray = [];
        for (let i = 1; i <= fileCount; i++) {
          const file = await fileStorage.methods.files(i).call();
          filesArray.push(file);
        }
        setFiles(filesArray);
      } else {
        console.error('FileStorage contract not deployed to detected network.');
        window.alert('FileStorage contract not deployed to detected network.');
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      window.alert('Error loading blockchain data. Please check the console for details.');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        loadBlockchainData();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        window.alert('Error connecting to MetaMask. Please try again.');
      }
    } else {
      window.alert('MetaMask is not installed. Please install it to use this app.');
    }
  };

  const captureFile = event => {
    event.preventDefault();
    const file = event.target.files[0];
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      if (reader.result) {
        setBuffer(Buffer.from(reader.result));
      } else {
        alert('Failed to read file.');
      }
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
  };

  const uploadFile = async description => {
    if (!buffer) {
      alert('No file selected or file reading failed.');
      return;
    }

    if (!fileStorage) {
      alert('FileStorage contract is not loaded.');
      return;
    }

    try {
      const result = await ipfs.add(buffer);
      const fileHash = result.path;
      fileStorage.methods.uploadFile(fileHash, description).send({ from: account }).on('transactionHash', hash => {
        setFiles([...files, { ipfsHash: fileHash, fileName: description, owner: account }]);
      });
    } catch (error) {
      console.error('IPFS file upload error:', error);
      alert('Failed to upload file to IPFS.');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Decentralized File Storage System</h1>
        <p>Upload your files to IPFS and store the metadata on the Ethereum blockchain.</p>
      </header>
      {isConnected ? (
        <div>
          <p>Account: {account}</p>
          <form onSubmit={event => {
            event.preventDefault();
            const description = document.getElementById('fileDescription').value;
            uploadFile(description);
          }}>
            <input type='file' onChange={captureFile} />
            <input id='fileDescription' type='text' placeholder='File description...' required />
            <input type='submit' />
          </form>
          <ul>
            {files.map((file, key) => (
              <li key={key}>
                <p>File Name: {file.fileName}</p>
                <p>File Hash: {file.ipfsHash}</p>
                <p>Owner: {file.owner}</p>
                <a href={`http://localhost:8080/ipfs/${file.ipfsHash}`} target='_blank' rel='noopener noreferrer'>View File</a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      <footer className="footer">
        <p>&copy; 2024 Decentralized File Storage. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
