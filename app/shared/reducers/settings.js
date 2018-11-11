import { get } from 'dot-prop-immutable';

import * as types from '../actions/types';

const initialState = {
  // If the wallet has ackknowledged understanding the smart contract tool
  acceptedContractInterface: false,
  // Enable advanced permissions management
  advancedPermissions: false,
  // The loaded account
  account: '',
  // The loaded authorization
  authorization: undefined,
  // The block explorer used
  blockExplorer: 'enumivo.qsx.io',
  // List of contacts
  contacts: [],
  // Custom tokens the wallet should be tracking
  customTokens: [
    // Always track the ENU token
    'enu.token:ENU'
  ],
  // State to view by default in DevTest
  devTestDefaultState: false,
  // Defaults to displaying resources remaining
  displayResourcesAvailable: true,
  // Default filter spam transfers to false
  filterSpamTransfersUnder: 0.0000,
  // Default Idle Timeout
  idleTimeout: 999999999,
  // Default language
  lang: '',
  // The node to connect to
  node: '',
  // Recent names that the wallet has bid on.
  recentBids: {},
  // Recent contracts the wallet has used
  recentContracts: [],
  // Allows the UI to start with only a connected node
  skipImport: false,
  // Allows users to go to link directly (without passing through DangerLink) when set to true
  skipLinkModal: false,
  // Window State Management
  setupData: {},
  // Wallet Password Validity Hash
  walletHash: false,
  // Wallet Status
  walletInit: false,
  // Wallet Mode (hot/cold/watch)
  walletMode: 'hot',
  // Wallet is Temporary
  walletTemp: false,
};

const validSettings = Object.keys(initialState);

export default function settings(state = initialState, action) {
  switch (action.type) {
    case types.RESET_ALL_STATES: {
      return Object.assign({}, initialState);
    }
    case types.WALLET_REMOVE: {
      return Object.assign({}, state, {
        account: '',
        walletInit: false,
        walletMode: 'hot'
      });
    }
    case types.SET_WALLET_HASH: {
      return Object.assign({}, state, {
        walletHash: action.payload.hash
      });
    }
    case types.SYSTEM_GETABI_SUCCESS: {
      const recentContracts = [...state.recentContracts];
      const contractName = get(action, 'payload.contract.account_name');
      if (!recentContracts.includes(contractName)) {
        recentContracts.unshift(contractName);
      }
      return Object.assign({}, state, {
        recentContracts: recentContracts.slice(0, 50)
      });
    }
    case types.SET_SETTING: {
      return Object.assign({}, state, action.payload);
    }
    case types.RESET_INVALID_SETTINGS: {
      return Object.assign({}, validSettings.reduce((o, setting) =>
        ({ ...o, [setting]: state[setting] }), {}));
    }
    default: {
      return state;
    }
  }
}
