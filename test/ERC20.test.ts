import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';
import {MyERC20, MyERC20__factory} from '../types/typechain';
import constants from '../constants';

describe('ERC20', () => {
  let myERC20: MyERC20;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let signers: SignerWithAddress[];

  before(async () => {
    [owner, alice, ...signers] = await ethers.getSigners();
    const erc20Factory = (await ethers.getContractFactory('MyERC20', owner)) as MyERC20__factory;
    myERC20 = await erc20Factory.deploy(constants.MyERC20.name, constants.MyERC20.symbol, constants.MyERC20.supply);
    await myERC20.deployed();
  });

  describe('deployment', async () => {
    it('should have correct name, symbol, and supply at owner', async () => {
      expect(await myERC20.name()).to.eq(constants.MyERC20.name);
      expect(await myERC20.symbol()).to.eq(constants.MyERC20.symbol);
      expect(await myERC20.balanceOf(owner.address)).to.eq(constants.MyERC20.supply);
    });
  });

  describe('transferring', async () => {
    const amount = ethers.utils.parseEther('10');

    it('should allow transfer of tokens', async () => {
      // transfer from owner to alice
      await expect(myERC20.transfer(alice.address, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(owner.address, alice.address, amount);
      expect(await myERC20.balanceOf(alice.address)).to.eq(amount);

      // transfer back
      await expect(myERC20.connect(alice).transfer(owner.address, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(alice.address, owner.address, amount);
      expect(await myERC20.balanceOf(alice.address)).to.eq(0);
    });

    it('should NOT allow transfer of insufficient amount', async () => {
      await expect(myERC20.connect(alice).transfer(owner.address, amount)).to.be.revertedWith(
        'ERC20: transfer amount exceeds balance'
      );
    });

    it('should allow approval & transferFrom of tokens', async () => {
      // owner approves alice for the transfer
      await expect(myERC20.approve(alice.address, amount))
        .to.emit(myERC20, 'Approval')
        .withArgs(owner.address, alice.address, amount);

      // alice calls transfer-from
      await expect(myERC20.connect(alice).transferFrom(owner.address, alice.address, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(owner.address, alice.address, amount);
      expect(await myERC20.balanceOf(alice.address)).to.eq(amount);

      // transfer back
      await expect(myERC20.connect(alice).transfer(owner.address, amount))
        .to.emit(myERC20, 'Transfer')
        .withArgs(alice.address, owner.address, amount);
      expect(await myERC20.balanceOf(alice.address)).to.eq(0);
    });
  });
});
