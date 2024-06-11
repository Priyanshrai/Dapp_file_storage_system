// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string ipfsHash;
        string fileName;
        address owner;
    }

    mapping(uint256 => File) public files;
    uint256 public fileCount;

    event FileUploaded(
        uint256 fileId,
        string ipfsHash,
        string fileName,
        address owner
    );

    function uploadFile(string memory _ipfsHash, string memory _fileName) public {
        fileCount++;
        files[fileCount] = File(_ipfsHash, _fileName, msg.sender);
        emit FileUploaded(fileCount, _ipfsHash, _fileName, msg.sender);
    }

    function getFile(uint256 _fileId) public view returns (string memory, string memory, address) {
        File memory file = files[_fileId];
        return (file.ipfsHash, file.fileName, file.owner);
    }
}
