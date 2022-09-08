import {ethers} from 'hardhat';
import {expect} from 'chai';
import {MyERC721, MyERC721__factory} from '../types/typechain';
import {Signer, constants as ethersConstants} from 'ethers';
import constants from '../constants';

describe('ERC721', () => {
  let myERC721: MyERC721;
  let owner: Signer;
  let ownerAddress: string;
  let alice: Signer;
  let aliceAddress: string;
  let signers: Signer[];

  before(async () => {
    [owner, alice, ...signers] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();
    const factory = (await ethers.getContractFactory('MyERC721', owner)) as MyERC721__factory;
    myERC721 = await factory.deploy(constants.MyERC721.name, constants.MyERC721.symbol, constants.MyERC721.supply);
    await myERC721.deployed();
  });

  describe('deployment', async () => {
    it('should have correct name, symbol and owner', async () => {
      expect(await myERC721.name()).to.eq(constants.MyERC721.name);
      expect(await myERC721.symbol()).to.eq(constants.MyERC721.symbol);
      expect(await myERC721.owner()).to.eq(ownerAddress);
    });
  });

  describe('minting', async () => {
    const numTokens = 5;
    const ownerTokensMint = Array(numTokens)
      .fill(undefined)
      .map((_, i) => i);
    const aliceTokensMint = ownerTokensMint.map(v => v + ownerTokensMint.length);

    // mint [0, 1, ..., n-1] to Owner
    it('should mint for Owner', async () => {
      await Promise.all(
        ownerTokensMint.map(expectedtokenId =>
          expect(myERC721.safeMint(ownerAddress))
            .to.emit(myERC721, 'Transfer')
            .withArgs(ethersConstants.AddressZero, ownerAddress, expectedtokenId)
        )
      );
      expect(await myERC721.balanceOf(ownerAddress)).to.eq(ownerTokensMint.length);
    });

    // mint [n, n+1, ..., n+n-1] to Alice
    it('should mint for Alice via Owner', async () => {
      await Promise.all(
        aliceTokensMint.map(expectedtokenId =>
          expect(myERC721.safeMint(aliceAddress))
            .to.emit(myERC721, 'Transfer')
            .withArgs(ethersConstants.AddressZero, aliceAddress, expectedtokenId)
        )
      );
      expect(await myERC721.balanceOf(aliceAddress)).to.eq(aliceTokensMint.length);
    });

    it('should NOT mint for Alice via Alice', async () => {
      await expect(myERC721.connect(alice).safeMint(aliceAddress)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  describe('transferring', async () => {
    const tokenId = 0; // this test will use the first token

    it('should allow transfer of an owned NFT', async () => {
      // transfer from owner to alice
      await expect(myERC721['safeTransferFrom(address,address,uint256)'](ownerAddress, aliceAddress, tokenId))
        .to.emit(myERC721, 'Transfer')
        .withArgs(ownerAddress, aliceAddress, tokenId);
      expect(await myERC721.ownerOf(tokenId)).to.eq(aliceAddress);

      // transfer back
      await expect(
        myERC721.connect(alice)['safeTransferFrom(address,address,uint256)'](aliceAddress, ownerAddress, tokenId)
      )
        .to.emit(myERC721, 'Transfer')
        .withArgs(aliceAddress, ownerAddress, tokenId);
      expect(await myERC721.ownerOf(tokenId)).to.eq(ownerAddress);
    });

    it('should NOT allow transfer of an NFT that is not owned', async () => {
      await expect(
        myERC721.connect(alice)['safeTransferFrom(address,address,uint256)'](ownerAddress, aliceAddress, tokenId)
      ).to.be.revertedWith('ERC721: caller is not token owner nor approved');
    });

    it('should allow approval & transferFrom of an owned NFT', async () => {
      // owner approves alice for the transfer
      await expect(myERC721.approve(aliceAddress, tokenId))
        .to.emit(myERC721, 'Approval')
        .withArgs(ownerAddress, aliceAddress, tokenId);

      // alice calls transfer-from
      await expect(
        myERC721.connect(alice)['safeTransferFrom(address,address,uint256)'](ownerAddress, aliceAddress, tokenId)
      )
        .to.emit(myERC721, 'Transfer')
        .withArgs(ownerAddress, aliceAddress, tokenId);
      expect(await myERC721.ownerOf(tokenId)).to.eq(aliceAddress);

      // transfer back
      await expect(
        myERC721.connect(alice)['safeTransferFrom(address,address,uint256)'](aliceAddress, ownerAddress, tokenId)
      )
        .to.emit(myERC721, 'Transfer')
        .withArgs(aliceAddress, ownerAddress, tokenId);
      expect(await myERC721.ownerOf(tokenId)).to.eq(ownerAddress);
    });
  });
});
