import {ethers} from 'hardhat';
import {expect} from 'chai';
import {MyERC20, MyERC20__factory} from '../types/typechain';
import {Signer} from 'ethers';
import constants from '../constants';
import {parseEther} from 'ethers/lib/utils';

describe('ERC20', () => {
  let myERC20: MyERC20;
  let owner: Signer;
  let ownerAddress: string;
  let alice: Signer;
  let aliceAddress: string;
  let signers: Signer[];

  before(async () => {
    [owner, alice, ...signers] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    aliceAddress = await alice.getAddress();
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

  describe('transferring', async () => {
    const amount = parseEther('10');

    it('should allow transfer of tokens', async () => {
      // transfer from owner to alice
      await expect(myERC20.transfer(aliceAddress, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(ownerAddress, aliceAddress, amount);
      expect(await myERC20.balanceOf(aliceAddress)).to.eq(amount);

      // transfer back
      await expect(myERC20.connect(alice).transfer(ownerAddress, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(aliceAddress, ownerAddress, amount);
      expect(await myERC20.balanceOf(aliceAddress)).to.eq(0);
    });

    it('should NOT allow transfer of insufficient amount', async () => {
      await expect(myERC20.connect(alice).transfer(ownerAddress, amount)).to.be.revertedWith(
        'ERC20: transfer amount exceeds balance'
      );
    });

    it('should allow approval & transferFrom of tokens', async () => {
      // owner approves alice for the transfer
      await expect(myERC20.approve(aliceAddress, amount))
        .to.emit(myERC20, 'Approval')
        .withArgs(ownerAddress, aliceAddress, amount);

      // alice calls transfer-from
      await expect(myERC20.connect(alice).transferFrom(ownerAddress, aliceAddress, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(ownerAddress, aliceAddress, amount);
      expect(await myERC20.balanceOf(aliceAddress)).to.eq(amount);

      // transfer back
      await expect(myERC20.connect(alice).transfer(ownerAddress, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(aliceAddress, ownerAddress, amount);
      expect(await myERC20.balanceOf(aliceAddress)).to.eq(0);
    });
  });
});
