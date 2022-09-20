import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {MyERC777, MyERC777__factory} from '../types/typechain';
import constants from '../constants';

describe('ERC777', () => {
  let myERC777: MyERC777;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let signers: SignerWithAddress[];

  before(async () => {
    [owner, alice, ...signers] = await ethers.getSigners();
    const erc777Factory = (await ethers.getContractFactory('MyERC777', owner)) as MyERC777__factory;
    myERC777 = await erc777Factory.deploy(
      constants.MyERC777.name,
      constants.MyERC777.symbol,
      constants.MyERC777.supply,
      [owner.address]
    );
    await myERC777.deployed();
  });

  describe('deployment', async () => {
    it('should have correct name, symbol, and supply at owner', async () => {
      expect(await myERC777.name()).to.eq(constants.MyERC777.name);
      expect(await myERC777.symbol()).to.eq(constants.MyERC777.symbol);
      expect(await myERC777.balanceOf(owner.address)).to.eq(constants.MyERC777.supply);
    });
  });

  describe('transferring', async () => {
    const amount = ethers.utils.parseEther('10');

    it('should allow transfer of tokens', async () => {
      // transfer from owner to alice
      await expect(myERC777.transfer(alice.address, amount))
        .to.emit(myERC777, 'Transfer')
        .withArgs(owner.address, alice.address, amount);
      expect(await myERC777.balanceOf(alice.address)).to.eq(amount);

      // transfer back
      await expect(myERC777.connect(alice).transfer(owner.address, amount))
        .to.emit(myERC777, 'Transfer')
        .withArgs(alice.address, owner.address, amount);
      expect(await myERC777.balanceOf(alice.address)).to.eq(0);
    });

    it('should NOT allow transfer of insufficient amount', async () => {
      await expect(myERC777.connect(alice).transfer(owner.address, amount)).to.be.revertedWith(
        'ERC777: transfer amount exceeds balance'
      );
    });

    it('should allow approval & transferFrom of tokens', async () => {
      // owner approves alice for the transfer
      await expect(myERC777.approve(alice.address, amount))
        .to.emit(myERC777, 'Approval')
        .withArgs(owner.address, alice.address, amount);

      // alice calls transfer-from
      await expect(myERC777.connect(alice).transferFrom(owner.address, alice.address, amount))
        .to.emit(myERC777, 'Transfer')
        .withArgs(owner.address, alice.address, amount);
      expect(await myERC777.balanceOf(alice.address)).to.eq(amount);

      // transfer back
      await expect(myERC777.connect(alice).transfer(owner.address, amount))
        .to.emit(myERC777, 'Transfer')
        .withArgs(alice.address, owner.address, amount);
      expect(await myERC777.balanceOf(alice.address)).to.eq(0);
    });
  });
});
