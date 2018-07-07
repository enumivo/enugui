import * as types from './types';

import enu from './helpers/enu';
import { getCurrencyBalance } from './accounts';

export function transfer(from, to, quantity, memo, symbol = 'ENU') {
  return (dispatch: () => void, getState) => {
    const {
      balances,
      connection
    } = getState();
    dispatch({
      type: types.SYSTEM_TRANSFER_PENDING
    });
    try {
      const contracts = balances.__contracts;
      const account = contracts[symbol];
      return enu(connection).transaction(account, contract => {
        contract.transfer(
          from,
          to,
          quantity,
          memo
        );
      }, {
        broadcast: connection.broadcast,
        expireInSeconds: connection.expireInSeconds,
        sign: connection.sign
      }).then((tx) => {
        dispatch(getCurrencyBalance(from));
        return dispatch({
          payload: { tx },
          type: types.SYSTEM_TRANSFER_SUCCESS
        });
      }).catch((err) => dispatch({
        payload: { err },
        type: types.SYSTEM_TRANSFER_FAILURE
      }));
    } catch (err) {
      return dispatch({
        payload: { err },
        type: types.SYSTEM_TRANSFER_FAILURE
      });
    }
  };
}

export default {
  transfer
};
