import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Buffer } from 'buffer';
import ipfs from './ipfs';
import FileStorage from './contracts/FileStorage.json';
import { Container, Navbar, Nav, Form, Button, Row, Col, Card } from 'react-bootstrap';

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
      console.log('IPFS result:', result);
      const fileHash = result.path;
      console.log('Uploading file with hash:', fileHash);
      fileStorage.methods.uploadFile(fileHash, description).send({ from: account })
        .on('transactionHash', hash => {
          console.log('Transaction hash:', hash);
          setFiles([...files, { ipfsHash: fileHash, fileName: description, owner: account }]);
        })
        .on('error', (error) => {
          console.error('Error in transaction:', error);
          window.alert('Failed to upload file to Ethereum. Check the console for details.');
        });
    } catch (error) {
      console.error('IPFS file upload error:', error);
      window.alert('Failed to upload file to IPFS.');
    }
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Decentralized File Storage</Navbar.Brand>
          <Nav className="ml-auto">
            {isConnected ? (
              <Nav.Link href="#">Account: {account}</Nav.Link>
            ) : (
              <Button variant="outline-light" onClick={connectWallet}>Connect Wallet</Button>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h2>Welcome to the Decentralized File Storage System</h2>
            <p>Upload your files to IPFS and store the metadata on the Ethereum blockchain.</p>
          </Col>
        </Row>

        {isConnected && (
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Upload File</Card.Title>
                  <Form onSubmit={event => {
                    event.preventDefault();
                    const description = document.getElementById('fileDescription').value;
                    uploadFile(description);
                  }}>
                    <Form.Group>
                      <Form.File label="Choose File" onChange={captureFile} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Control type="text" id="fileDescription" placeholder="File description..." required />
                    </Form.Group>
                    <Button type="submit">Upload</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row>
          <Col>
            <h3>Uploaded Files</h3>
            <ul className="list-unstyled">
              {files.map((file, key) => (
                <li key={key} className="mb-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>{file.fileName}</Card.Title>
                      <Card.Text>
                        <strong>Hash:</strong> {file.ipfsHash}<br />
                        <strong>Owner:</strong> {file.owner}
                      </Card.Text>
                      <Button variant="primary" href={`http://localhost:8080/ipfs/${file.ipfsHash}`} target="_blank" rel="noopener noreferrer">View File</Button>
                    </Card.Body>
                  </Card>
                </li>
              ))}
            </ul>
          </Col>
        </Row>
      </Container>

      <footer className="bg-dark text-white mt-4 p-4 text-center">
        <Container>
          <p>&copy; 2024 Decentralized File Storage. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default App;
