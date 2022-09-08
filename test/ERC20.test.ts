import {ethers} from 'hardhat';
import {expect} from 'chai';
import {MyERC20, MyERC20__factory} from '../types/typechain';
import {Signer} from 'ethers';
import constants from '../constants';

describe('ERC20', () => {
  let myERC20: MyERC20;
  let owner: Signer;
  let ownerAddress: string;
  let signers: Signer[];

  before(async () => {
    [owner, ...signers] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    const erc20Factory = (await ethers.getContractFactory('MyERC20', owner)) as MyERC20__factory;
    myERC20 = await erc20Factory.deploy(constants.MyERC20.name, constants.MyERC20.symbol, constants.MyERC20.supply);
    await myERC20.deployed();
  });

  describe('deployment', async () => {
    it('should have correct name, symbol, and supply at owner', async () => {
      expect(await myERC20.name()).to.eq(constants.MyERC20.name);
      expect(await myERC20.symbol()).to.eq(constants.MyERC20.symbol);
      expect(await myERC20.balanceOf(ownerAddress)).to.eq(constants.MyERC20.supply);
    });
  });

  describe('transferring', async () => {});
});
