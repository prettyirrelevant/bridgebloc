import LxlyTxnBtn from "./LxlyTxnBtn";
import CctpTxnBtn from "./CctpTxnBtn";
import CircleTxnBtn from "./circleTxnBtn";
import { useApp } from "context/AppContext";
import TxnToken from "./components/sourceToken";
import SourceChain from "./components/sourceChain";
import DestinationChain from "./components/destinationChain";
import DestinationToken from "./components/destinationToken";

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
              <div className="bridge-block">
                <p>
                  This process will make use of{" "}
                  <span
                    style={{
                      textTransform: "capitalize",
                    }}
                  >
                    {currentRoute?.route?.split("_").join(" ")}
                  </span>
                </p>
              </div>
            )}

            {currentRoute?.route === "circle_api" ? (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;
