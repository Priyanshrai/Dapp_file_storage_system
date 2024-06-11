import { create } from 'ipfs-http-client';

// Connect to the local IPFS node
const ipfs = create({
  host: 'localhost',
  port: '5001',
  protocol: 'http',
});

export default ipfs;
