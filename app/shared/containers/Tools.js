// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import compose from 'lodash/fp/compose';

import { Menu, Tab, Item } from 'semantic-ui-react';

import ContractInterface from './Contract/Interface';
import GlobalUtilsPingContainer from './Global/Utils/Ping';
import RecommendationInterface from './Recommendation/Interface';

import Tools from '../components/Tools';
import ToolsBidName from '../components/Tools/BidName';
import ToolsBlockchains from '../components/Tools/Blockchains';
import ToolsContacts from '../components/Tools/Contacts';
import ToolsCreateAccount from '../components/Tools/CreateAccount';
import ToolsCustomTokens from '../components/Tools/CustomTokens';
import ToolsDelegations from '../components/Tools/Delegations';
import ToolsKeys from '../components/Tools/Keys';
import ToolsKeysValidator from '../components/Tools/Keys/Validator';
import ToolsPermissions from '../components/Tools/Permissions';
import ToolsProxy from '../components/Tools/Proxy';
import ToolsReset from '../components/Tools/Reset';
import ToolsStateChain from '../components/Tools/State/Chain';
import ToolsStateGlobals from '../components/Tools/State/Globals';
import ToolsStateWallet from '../components/Tools/State/Wallet';
import ToolsSystemLog from '../components/Tools/System/Log';
import ToolsWallets from '../components/Tools/Wallets';

import * as AccountsActions from '../actions/accounts';
import * as BidNameActions from '../actions/system/bidname';
import * as ContractsActions from '../actions/contracts';
import * as CreateAccountActions from '../actions/createaccount';
import * as CustomTokensActions from '../actions/customtokens';
import * as GlobalsActions from '../actions/globals';
import * as NameBidsActions from '../actions/namebids';
import * as ProducersActions from '../actions/producers';
import * as RegProxyActions from '../actions/system/regproxy';
import * as RegproxyinfoActions from '../actions/system/community/regproxyinfo';
import * as SettingsActions from '../actions/settings';
import * as StakeActions from '../actions/stake';
import * as SystemStateActions from '../actions/system/systemstate';
import * as TableActions from '../actions/table';
import * as TransactionActions from '../actions/transaction';
import * as TransferActions from '../actions/transfer';
import * as UnregProxyActions from '../actions/system/unregproxy';
import * as UpdateAuthActions from '../actions/system/updateauth';
import * as WalletActions from '../actions/wallet';
import * as WalletsActions from '../actions/wallets';
import * as AppActions from '../actions/app';

const paneMapping = [
  {
    element: Tools,
    modes: ['cold', 'hot', 'watch', 'skip', 'temp'],
    name: 'index',
  },
  {
    element: ToolsWallets,
    modes: ['cold', 'hot', 'watch'],
    name: 'wallets',
  },
  {
    element: ToolsBlockchains,
    modes: ['cold', 'hot', 'watch', 'skip'],
    name: 'blockchains',
  },
  {
    header: true,
    modes: ['cold', 'hot', 'watch', 'skip', 'temp'],
    name: 'wallet',
  },
  {
    element: ToolsCustomTokens,
    modes: ['hot', 'watch', 'temp'],
    name: 'customtokens',
  },
  {
    element: ToolsDelegations,
    modes: ['hot', 'watch', 'temp'],
    name: 'delegations'
  },
  {
    element: ToolsPermissions,
    modes: ['hot', 'watch', 'temp'],
    name: 'permissions',
  },
  {
    element: RecommendationInterface,
    modes: ['hot', 'watch', 'temp'],
    name: 'recommendation',
  },
  {
    element: ContractInterface,
    modes: ['hot', 'watch', 'skip', 'temp'],
    name: 'contracts',
  },
  {
    header: true,
    modes: ['cold', 'hot', 'watch', 'skip', 'temp'],
    name: 'services',
  },
  {
    header: true,
    modes: ['cold', 'hot', 'watch', 'skip', 'temp'],
    name: 'utilities',
  },
  {
    container: true,
    element: GlobalUtilsPingContainer,
    modes: ['cold', 'hot', 'watch', 'skip', 'temp'],
    name: 'ping',
    requiredContract: 'producerinfo'
  },
  {
    element: ToolsContacts,
    modes: ['hot', 'watch'],
    name: 'contacts',
  },
  {
    element: ToolsCreateAccount,
    modes: ['hot', 'watch', 'temp'],
    name: 'create_account',
  },
  {
    element: ToolsKeys,
    modes: ['cold', 'hot', 'skip', 'watch', 'temp'],
    name: 'keygenerator',
  },
  {
    element: ToolsKeysValidator,
    modes: ['cold', 'hot', 'skip', 'watch', 'temp'],
    name: 'keyvalidator',
  },
  {
    element: ToolsBidName,
    modes: ['hot', 'watch'],
    name: 'name_bidding'
  },
  {
    element: ToolsProxy,
    modes: ['hot', 'watch', 'temp'],
    name: 'proxy',
  },
  {
    header: true,
    modes: ['cold', 'hot', 'watch', 'skip', 'temp'],
    name: 'state',
  },
  {
    element: ToolsSystemLog,
    modes: ['cold', 'hot', 'skip', 'watch', 'temp'],
    name: 'system_log'
  },
  {
    element: ToolsStateChain,
    modes: ['hot', 'watch', 'temp'],
    name: 'state_chain',
  },
  {
    element: ToolsStateGlobals,
    modes: ['hot', 'watch', 'temp'],
    name: 'state_globals',
  },
  {
    element: ToolsStateWallet,
    modes: ['cold', 'hot', 'skip', 'watch', 'temp'],
    name: 'state',
  },
  {
    header: true,
    modes: ['cold', 'hot', 'watch', 'skip', 'temp'],
    name: 'advanced',
  },
  {
    element: ToolsReset,
    modes: ['cold', 'hot', 'skip', 'watch', 'temp'],
    name: 'reset',
  },
];

class ToolsContainer extends Component<Props> {
  getPanes() {
    const {
      allBlockExplorers,
      connection,
      t
    } = this.props;
    return paneMapping
    .filter((pane) => {
      const {
        settings
        } = this.props;
        const {
          skipImport,
          walletMode,
          walletTemp
        } = settings;

        const paneRequiresContract = !!pane.requiredContract;
        if (paneRequiresContract) {
          if (connection.supportedContracts &&
            connection.supportedContracts.constructor === Array) {
            const blockchainHasContract =
              connection.supportedContracts.includes(pane.requiredContract);
            if (!blockchainHasContract) {
              return false;
            }
          }
        }
        return (
          !walletMode
          || (walletTemp && pane.modes.includes('temp'))
          || (!skipImport && !walletTemp && pane.modes.includes(walletMode))
          || (skipImport && pane.modes.includes('skip'))
        );
      })
      .map((pane) => {
        const {
          chain
          } = this.props;
        if (pane.header) {
          return {
            menuItem: (
              <Menu.Header
                active='false'
                className="ui"
                content={t(`tools_menu_${pane.name}_header`)}
                key={pane.name}
              />
            )
          };
        }

        return {
          menuItem: t(`tools_menu_${pane.name}`),
          render: () => {
            if (pane.container) {
              return (
                <Tab.Pane>
                  {React.createElement(pane.element)}
                </Tab.Pane>
              );
            }
            return (
              <Tab.Pane>
                {React.createElement(pane.element, {
                  blockExplorers: allBlockExplorers[connection.chainKey],
                  ...this.props
                })}
              </Tab.Pane>
            );
          }
        };
      });
  }
  render() {
    const panes = this.getPanes();
    return (
      <Tab
        menu={{
          fluid: true,
          vertical: true,
          pointing: true,
          secondary: true
        }}
        panes={panes}
        defaultActiveIndex={0}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    accounts: state.accounts,
    allBlockExplorers: state.blockexplorers,
    app: state.app,
    balances: state.balances,
    blockchains: state.blockchains,
    chain: state.chain,
    connection: state.connection,
    contracts: state.contracts,
    customtokens: state.customtokens,
    globals: state.globals,
    keys: state.keys,
    settings: state.settings,
    system: state.system,
    systemlog: state.systemlog,
    tables: state.tables,
    transaction: state.transaction,
    validate: state.validate,
    wallet: state.wallet,
    wallets: state.wallets,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...AccountsActions,
      ...AppActions,
      ...BidNameActions,
      ...ContractsActions,
      ...CreateAccountActions,
      ...CustomTokensActions,
      ...GlobalsActions,
      ...NameBidsActions,
      ...ProducersActions,
      ...RegProxyActions,
      ...RegproxyinfoActions,
      ...SettingsActions,
      ...StakeActions,
      ...SystemStateActions,
      ...TableActions,
      ...TransactionActions,
      ...TransferActions,
      ...UnregProxyActions,
      ...UpdateAuthActions,
      ...WalletActions,
      ...WalletsActions,
    }, dispatch)
  };
}

export default compose(
  withRouter,
  translate('tools'),
  connect(mapStateToProps, mapDispatchToProps)
)(ToolsContainer);
