![Decentralized File Storage System](https://github.com/Priyanshrai/Dapp_file_storage_system/assets/105690577/3a007c6d-ecd2-46e8-942c-b66219a30092)


# Decentralized File Storage System

A decentralized file storage system using IPFS (InterPlanetary File System) and Ethereum. Users can upload files to IPFS, and the file metadata and ownership information are stored on the blockchain.

## Features

- Upload files to IPFS.
- Store file metadata and ownership information on Ethereum.
- View and download stored files.
- Ownership verification and access control.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed
- Truffle installed globally
- Ganache installed and running
- MetaMask extension installed in your browser

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/Decentralized-File-Storage-System.git
   ```

2. Navigate to the project directory

   ```bash
   cd Decentralized-File-Storage-System
   ```

3. Install dependencies for the client

   ```bash
   cd client
   npm install
   ```

4. Install dependencies for the contracts

   ```bash
   cd ..
   npm install
   ```

## Usage

### Running the Local Blockchain

1. Open Ganache and start a new workspace.
2. Note the RPC server URL (usually `http://localhost:7545`).

### Deploying Smart Contracts

1. Compile the smart contracts

   ```bash
   truffle compile
   ```

2. Deploy the smart contracts

   ```bash
   truffle migrate --network development
   ```

### Running the Client

1. Navigate to the `client` directory

   ```bash
   cd client
   ```

2. Start the React application

   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:8081`.

### Using the Application

1. Open MetaMask and connect it to the local blockchain (usually `http://localhost:7545`).
2. Click the "Connect Wallet" button to connect MetaMask to the application.
3. Upload a file using the form provided.
4. View the uploaded files in the list.

## Project Structure

- `client/` - Contains the React frontend
- `contracts/` - Contains the Solidity smart contracts
- `migrations/` - Contains migration scripts for deploying the contracts
- `src/` - Contains the main application source files
- `test/` - Contains test scripts for the smart contracts


Feel free to customize this README to fit your specific project needs. Replace placeholder URLs and details with your actual information.
```
