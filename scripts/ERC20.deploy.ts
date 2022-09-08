import {ethers} from 'hardhat';
import {ERC20, ERC20__factory} from '../types/typechain';
import constants from '../constants';

/**
 * Deploys an ERC20 contract. Name and Symbol is given from `constants`
 * @returns address of the deployed contract
 */
export default async function main(): Promise<string> {
  console.log('\n[ERC20 Contract]');
  const factory = (await ethers.getContractFactory('MyERC20')) as ERC20__factory;
  const contract = (await factory.deploy(constants.MyERC20.name, constants.MyERC20.symbol)) as ERC20;
  await contract.deployed();

  console.log(`\tContract is deployed at ${contract.address}`);
  return contract.address;
}

if (require.main === module) {
  main();
}
