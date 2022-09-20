import {ethers} from 'hardhat';
import type {MyERC777__factory} from '../types/typechain';
import constants from '../constants';

/**
 * Deploys an ERC777 contract. Name and Symbol is given from `constants`
 * @returns address of the deployed contract
 */
export default async function main(): Promise<string> {
  console.log('\n[MyERC777 Contract]');
  const factory = (await ethers.getContractFactory('MyERC777')) as MyERC777__factory;
  const contract = await factory.deploy(
    constants.MyERC777.name,
    constants.MyERC777.symbol,
    constants.MyERC777.supply,
    []
  );
  await contract.deployed();

  console.log(`\tContract is deployed at ${contract.address}`);
  return contract.address;
}

if (require.main === module) {
  main();
}
