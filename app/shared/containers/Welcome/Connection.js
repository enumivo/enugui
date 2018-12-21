// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { find } from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import compose from 'lodash/fp/compose';
import { translate } from 'react-i18next';
import { Button, Checkbox, Container, Form, Input, Message, Popup } from 'semantic-ui-react';

import GlobalBlockchainDropdown from '../Global/Blockchain/Dropdown';

import * as AccountsActions from '../../actions/accounts';
import * as SettingsActions from '../../actions/settings';
import * as ValidateActions from '../../actions/validate';
import * as WalletActions from '../../actions/wallet';

const { shell } = require('electron');

type Props = {
  actions: {
    setSettingWithValidation: () => void
  },
  connection: {},
  onStageSelect: () => void,
  settings: {},
  t: () => void,
  validate: {}
};

class WelcomeConnectionContainer extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      node: props.settings.node || 'https://eos.greymass.com',
      sslConfirm: false
    };
  }

  componentDidMount() {
    const { actions, settings } = this.props;
    if (settings.skipImport) {
      actions.validateNode(settings.node);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.settings.node !== this.state.node) {
      this.setState({ node: nextProps.settings.node });
    }
  }

  useColdWallet = (e) => {
    const {
      actions,
      onStageSelect
    } = this.props;
    const {
      setWalletMode
    } = actions;
    // Immediately set the wallet into cold storage mode
    setWalletMode('cold');
    // Move to account stage
    onStageSelect(2);
    e.preventDefault();
    return false;
  }

  openLink = (link) => shell.openExternal(link);

  isSafeish = (url) => url && (url.startsWith('http:') || url.startsWith('https:'))

  onChange =  (e, { name, value }) => {
    this.setState({
      [name]: value,
    });
  }

  onConfirm = (e, { checked }) => {
    this.setState({
      sslConfirm: checked
    });
  }

  onConnect = () => {
    const {
      node
    } = this.state;
    const {
      actions,
      onStageSelect,
      settings
    } = this.props;
    const {
      getAccount,
      setSettingWithValidation,
      setWalletMode
    } = actions;
    setSettingWithValidation('node', node);
    if (onStageSelect) {
      onStageSelect(2);
    }
    if (settings.walletMode === 'cold') {
      setWalletMode('hot');
    }
    if (settings.account) {
      getAccount(settings.account);
    }
  }

  onToggle = () => this.setState({ editing: !this.state.editing });

  render() {
    const {
      t,
      connection,
      settings,
      validate
    } = this.props;
    let {
      autoFocus
    } = this.props;
    if (autoFocus === undefined) {
      autoFocus = true;
    }
    const {
      node,
      sslConfirm
    } = this.state;
    // let formattedHost = '';
    let sslEnabled = false;
    let validUrl = false;
    try {
      const {
        // host,
        protocol
      } = new URL(node);
      validUrl = true;
      sslEnabled = (protocol === 'https:');
      // formattedHost = host;
    } catch (e) {
      // console.log('url error', e);
    }
    let message = (
      <Message
        color="blue"
        content={(
          <p>
            <a
              onClick={() => this.openLink('https://github.com/greymass/eos-voter/blob/master/nodes.md')}
              onKeyPress={() => this.openLink('https://github.com/greymass/eos-voter/blob/master/nodes.md')}
              role="link"
              style={{ cursor: 'pointer' }}
              tabIndex={0}
            >
              {t('welcome:welcome_more_servers_2')}
            </a>
          </p>
        )}
        icon="info circle"
        info
        header={t('welcome:welcome_more_servers_1')}
      />
    );
    let checkbox = false;
    // display an error if the server could not be validated
    if (validate.NODE === 'FAILURE') {
      message = (
        <Message
          color="red"
          content={t('welcome:welcome_server_connection_fail_content')}
          header={t('welcome:welcome_server_connection_fail_title')}
          icon="warning sign"
        />
      );
    }
    // display a warning + checkbox if non-ssl
    if (validUrl && !sslEnabled) {
      if (!sslConfirm) {
        message = (
          <Message
            color="orange"
            content={t('welcome:welcome_ssl_warning_content')}
            header={t('welcome:welcome_ssl_warning_title')}
            icon="warning sign"
          />
        );
      }
      checkbox = (
        <p>
          <Checkbox
            label={t('welcome:welcome_ssl_warning_confirm')}
            onChange={this.onConfirm}
            checked={sslConfirm}
          />
        </p>
      );
    }
    const historyPluginMessage = !connection.historyPluginEnabled && (
      <Popup
        content={t('welcome:welcome_history_plugin_warning_content')}
        trigger={
         <Message
          color="red"
          content={t('welcome:welcome_history_plugin_warning_title')}
          icon="warning"
        />
        }
      />
    );
    // safeish true and ssl or non-ssl confirmed
    const disabled = !(this.isSafeish(node) && (sslConfirm || sslEnabled));

    return (
      <Form>
        <Form.Field
          autoFocus={autoFocus}
          control={Input}
          fluid
          icon={(validate.NODE === 'SUCCESS') ? 'checkmark' : 'x'}
          label={t('wallet_panel_form_node')}
          loading={(validate.NODE === 'PENDING')}
          name="node"
          onChange={this.onChange}
          placeholder={`https://...`}
          value={node}
        />
        <Form.Field>
          <label>{t('welcome:welcome_network_config')}</label>
          <GlobalBlockchainDropdown
            selection
          />
        </Form.Field>
        {message}
        {historyPluginMessage}
        {checkbox}
        <Container textAlign="center">
          <Button
            content={t('welcome:welcome_connect_server')}
            disabled={disabled}
            icon="exchange"
            fluid={(settings.walletInit)}
            onClick={this.onConnect}
            primary
            size="small"
            style={{ marginTop: '1em' }}
          />
        </Container>
      </Form>
    );
  }
}

function mapStateToProps(state) {
  return {
    connection: state.connection,
    settings: state.settings,
    validate: state.validate
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...AccountsActions,
      ...SettingsActions,
      ...ValidateActions,
      ...WalletActions
    }, dispatch)
  };
}

export default compose(
  withRouter,
  translate('wallet'),
  connect(mapStateToProps, mapDispatchToProps)
)(WelcomeConnectionContainer);
