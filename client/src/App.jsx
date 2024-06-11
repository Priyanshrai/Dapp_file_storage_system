import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Buffer } from 'buffer'; // Import Buffer from buffer library
import ipfs from './ipfs';
import FileStorage from './contracts/FileStorage.json';

const App = () => {
  const [account, setAccount] = useState('');
  const [fileStorage, setFileStorage] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const networkData = FileStorage.networks[networkId];
    if (networkData) {
      const fileStorage = new web3.eth.Contract(FileStorage.abi, networkData.address);
      setFileStorage(fileStorage);
      const fileCount = await fileStorage.methods.fileCount().call();
      for (let i = 1; i <= fileCount; i++) {
        const file = await fileStorage.methods.files(i).call();
        setFiles(files => [...files, file]);
      }
    } else {
      window.alert('FileStorage contract not deployed to detected network.');
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
    <div>
      <h1>Decentralized File Storage System</h1>
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
            <a href={`https://ipfs.infura.io/ipfs/${file.ipfsHash}`} target='_blank' rel='noopener noreferrer'>View File</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
