import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {MyERC1155, MyERC1155__factory} from '../types/typechain';
import constants from '../constants';

describe('ERC1155', () => {
  let myERC1155: MyERC1155;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;

  before(async () => {
    [owner, alice] = await ethers.getSigners();
    const erc1155Factory = (await ethers.getContractFactory('MyERC1155', owner)) as MyERC1155__factory;
    myERC1155 = await erc1155Factory.deploy(constants.MyERC1155.URI);
    await myERC1155.deployed();
  });

  describe('deployment', async () => {
    it('should have correct URI & balance at owner', async () => {
      // 0 does not mean anything here, as it requires same URI with {id} to be replaced on client
      expect(await myERC1155.uri(0)).to.eq(constants.MyERC1155.URI);
    });
  });

  describe('minting', async () => {
    it('should mint for Owner', async () => {
      // mint nfts
      await Promise.all(
        constants.MyERC1155.supplies.map((s, i) =>
          expect(myERC1155.safeMint(owner.address, s, '0x'))
            .to.emit(myERC1155, 'TransferSingle')
            .withArgs(owner.address, ethers.constants.AddressZero, owner.address, i, s)
        )
      );

      // single balance check
      expect(await myERC1155.balanceOf(owner.address, 0)).to.eql(constants.MyERC1155.supplies[0]);

      // batch balance check
      expect(
        await myERC1155.balanceOfBatch(
          constants.MyERC1155.supplies.map(() => owner.address), // owner for each token
          constants.MyERC1155.supplies.map((_, i) => i) // map supply array to tokenIDs via index
        )
      ).to.eql(constants.MyERC1155.supplies);
    });
  });
});
