// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import compose from 'lodash/fp/compose';
import { Button, Checkbox, Divider, Dropdown, Header, Icon, Modal, Segment, Tab } from 'semantic-ui-react';

import GlobalButtonElevate from '../../Button/Elevate';
import GlobalFormFieldAccount from '../../../../components/Global/Form/Field/Account';
import GlobalFormFieldKeyPrivate from '../../../../components/Global/Form/Field/Key/Private';

import * as AccountsActions from '../../../../actions/accounts';
import * as SettingsActions from '../../../../actions/settings';
import * as WalletsActions from '../../../../actions/wallets';

class GlobalModalAccountImportCold extends Component<Props> {
  state = {
    account: '',
    accountValid: false,
    authorization: 'active',
    key: '',
    keyValid: false
  }
  componentDidMount() {
    this.props.actions.clearAccountByKey();
  }
  importAccounts = (password) => {
    const {
      account,
      authorization,
      key
    } = this.state;
    const {
      actions,
      settings,
    } = this.props;
    actions.importWallet(settings.chainId, account, authorization, key, password, 'cold');
    this.props.onClose();
  }
  onChange = (e, { name, valid, value }) => {
    this.setState({
      [name]: value,
      [`${name}Valid`]: valid
    });
  }
  setAuthorization = (e, { value }) => {
    this.setState({
      authorization: value
    });
  }
  render() {
    const {
      accounts,
      onClose,
      settings,
      system,
      t,
      validate
    } = this.props;
    const {
      account,
      accountValid,
      authorization,
      key,
      keyValid
    } = this.state;
    const disabled = (!accountValid || !keyValid);
    const options = ['active', 'owner'].map((authority) => (
      {
        key: authority,
        text: authority,
        value: authority
      }
    ));
    return (
      <Tab.Pane>
        <Segment basic>
          <Segment attached="top">
            <GlobalFormFieldAccount
              autoFocus
              fluid
              label={t('global_account_import_watch_account')}
              name="account"
              placeholder={t('welcome:welcome_account_compare_placeholder')}
              onChange={this.onChange}
              ref={(input) => { this.input = input; }}
              value={account}
            />
          </Segment>
          <Segment attached>
            <GlobalFormFieldKeyPrivate
              label={t('global_account_import_private_key')}
              name="key"
              placeholder={t('welcome:welcome_key_compare_placeholder')}
              onChange={this.onChange}
              value={key}
            />
          </Segment>
          <Segment attached="bottom">
            <p>{t('tools:tools_form_permissions_auth_permission')}</p>
            <Dropdown
              defaultValue={authorization}
              fluid
              onChange={this.setAuthorization}
              options={options}
              selection
            />
          </Segment>
        </Segment>
        <Divider />
        <Segment basic clearing>
          <Button
            floated="left"
            onClick={onClose}
          >
            <Icon name="x" /> {t('cancel')}
          </Button>
          <GlobalButtonElevate
            onSuccess={this.importAccounts}
            settings={settings}
            trigger={(
              <Button
                color="green"
                content={t('global_button_account_import_action')}
                disabled={disabled}
                floated="right"
                icon="circle plus"
              />
            )}
            validate={validate}
          />
        </Segment>
      </Tab.Pane>
    );
  }
}


function mapStateToProps(state) {
  return {
    accounts: state.accounts,
    settings: state.settings,
    system: state.system,
    validate: state.validate
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...AccountsActions,
      ...SettingsActions,
      ...WalletsActions
    }, dispatch)
  };
}

export default compose(
  translate('global'),
  connect(mapStateToProps, mapDispatchToProps)
)(GlobalModalAccountImportCold);
