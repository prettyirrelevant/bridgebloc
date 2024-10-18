import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { useApp } from 'context/AppContext';
import { Globe, LogOut } from 'lucide-react';
import AppLogo from 'components/common/icons';
import { useNetworkState } from 'react-use';
import { Swap } from '@phosphor-icons/react';
import { constrictAddress } from 'helpers/wallet';
// @ts-ignore
import avatar from '../../images/avatar.png';

const Navbar = () => {
  const onlineState = useNetworkState();
  const { setAuthorization } = useApp();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();

  const { data: balance, isLoading: loadingBalance } = useBalance({
    address: address,
  });

  return (
    <header>
      <div className="header-content">
        <Link to={'/'} className="header-content__logo">
          <AppLogo size={130} />
        </Link>

        <div className="header-content__buttons">
          <>
            {isConnected ? (
              <>
                <Link to={'/conversions'} className="menu-button auto">
                  <Swap size={18} />
                  <p>Conversions</p>
                </Link>

                <button className="menu-button">
                  <div
                    style={{
                      height: 20,
                      position: 'relative',
                    }}
                  >
                    <Globe size={20} />
                    <div
                      style={{
                        bottom: -2,
                        right: -4,
                        width: 12,
                        height: 12,
                        borderRadius: 10,
                        position: 'absolute',
                        backgroundColor: onlineState?.online
                          ? '#28a745'
                          : '#f00',
                        border: '3px solid var(--white)',
                      }}
                    />
                  </div>
                </button>

                <button
                  className="menu-button"
                  onClick={() => {
                    disconnect();
                    localStorage.removeItem('authorization');
                    setAuthorization({
                      address: '',
                      signature: '',
                    });
                  }}
                >
                  <LogOut size={20} />
                </button>
                <div className="account-details">
                  <div className="account-details__image">
                    <img
                      src={avatar}
                      alt="avatar"
                      className="account-details__image"
                    />
                  </div>
                  <div className="account-details__info">
                    <p>{constrictAddress(address ?? '')}</p>
                    {!loadingBalance && balance && (
                      <p className="ens">{`${Number(balance.formatted).toFixed(
                        4,
                      )} ${balance.symbol}`}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {connectors.map((connector) => (
                  <button
                    key={connector.name}
                    onClick={() => {
                      connect({ connector });
                    }}
                    className="wallet-connect-btn"
                  >
                    Connect Wallet
                    {isLoading && connector.id === pendingConnector?.id && (
                      <>
                        <ClipLoader
                          size={13}
                          color={'#888'}
                          cssOverride={{
                            marginLeft: 8,
                          }}
                          aria-label="Loading Spinner"
                        />
                      </>
                    )}
                  </button>
                ))}
              </>
            )}
          </>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
