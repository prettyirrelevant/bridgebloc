import CctpTxnBtn from './CctpTxnBtn';
import { useApp } from 'context/AppContext';
import TxnToken from './components/sourceToken';
import SourceChain from './components/sourceChain';
import DestinationChain from './components/destinationChain';
import DestinationToken from './components/destinationToken';
import { AlertCircle } from 'lucide-react';

const Bridge = () => {
  const { currentRoute } = useApp();

  return (
    <div className="bridge-page">
      <div className="bridge-container">
        <div className="bridge">
          <div className="bridge-header">
            <p className="title">Bridge Tokens</p>
            <p className="subtitle">
              Transfer your tokens from one network to the other.
            </p>
          </div>

          <div className="bridge-options">
            <SourceChain />
            <DestinationChain />
            <TxnToken />
            <DestinationToken />

            {currentRoute?.route && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  backgroundColor: 'white',
                  border: '1px solid #111',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  marginTop: '0.5rem',
                }}
              >
                <AlertCircle
                  style={{
                    color: '#242424',
                    marginRight: '0.75rem',
                    flexShrink: 0,
                  }}
                />
                <p style={{ color: '#242424', margin: 0 }}>
                  This process will make use of{' '}
                  <span
                    style={{
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                    }}
                  >
                    {currentRoute.route.split('_').join(' ')}
                  </span>
                </p>
              </div>
            )}

            <CctpTxnBtn />
            {/* {currentRoute?.route === "circle_api" ? (
              <CircleTxnBtn />
            ) : currentRoute?.route === "cctp" ? (
              <CctpTxnBtn />
            ) : currentRoute?.route === "lxly" ? (
              <LxlyTxnBtn />
            ) : (
              <button
                className="primary-btn"
                style={{
                  marginTop: "10px",
                }}
              >
                Continue
              </button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;
