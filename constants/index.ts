import {parseEther} from 'ethers/lib/utils';

const contractConstants = {
  MyERC20: {
    supply: parseEther('100'),
    name: 'My ERC20 Token',
    symbol: 'M20',
  },
  MyERC777: {
    supply: parseEther('100'),
    name: 'My ERC777 Token',
    symbol: 'M777',
  },
  MyERC721: {
    supply: 100,
    name: 'My ERC721 Token',
    symbol: 'M721',
  },
  MyERC1155: {
    supply: 1000,
    name: 'My ERC1155 Token',
    symbol: 'M1155',
  },
};

export default contractConstants as Readonly<typeof contractConstants>;
