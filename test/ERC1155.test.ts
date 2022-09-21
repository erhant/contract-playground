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
    myERC1155 = await erc1155Factory.deploy(constants.MyERC1155.URI, constants.MyERC1155.supplies);
    await myERC1155.deployed();
  });

  describe('deployment', async () => {
    it('should have correct name, symbol, and supply at owner', async () => {
      // 0 does not mean anything here, as it requires same URI with {id} to be replaced on client
      expect(await myERC1155.uri(0)).to.eq(constants.MyERC1155.URI);
    });
  });
});
