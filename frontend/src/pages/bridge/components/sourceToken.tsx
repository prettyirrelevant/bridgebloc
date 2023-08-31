import { useApp } from "context/AppContext";
import { capitalizeFirst } from "helpers/text";
import useAppMenu from "hooks/useAppMenu";
import { ChevronDown } from "lucide-react";

const SourceToken = () => {
  const {
    transferAmt,
    chainTokens,
    currentToken,
    setTransferAmt,
    setCurrentToken,
  } = useApp();

  const [AppMenu] = useAppMenu({
    items: chainTokens,
    isObject: true,
    setDefault: true,
    objectKeys: {
      name: "symbol",
      img: "image_url",
    },
    defaultOption: null,
    onOptionChange: (option: any) => {
      setCurrentToken(chainTokens.find(token => token.symbol === option) ?? {});
    },
  });

  return (
    <div className="bridge-block">
      <p className="bridge-block__title">Select token</p>

      <div
        className={`bridge-block__btn ${
          !currentToken?.symbol ? "full-width" : ""
        }`}
      >
        <AppMenu gap={18} align="center" capitals>
          <div
            className={`token-select ${
              !currentToken?.symbol ? "full-width" : ""
            }`}
          >
            <div className="bridge-block__btn-token">
              <div className="token-img">
                {currentToken?.image_url && (
                  <img
                    src={currentToken?.image_url ?? "/images/avatar.png"}
                    alt={currentToken?.symbol ?? "eth"}
                  />
                )}
              </div>
              <p className="token-name">
                {currentToken?.symbol
                  ? capitalizeFirst(currentToken?.symbol?.split("_").join(" "))
                  : ""}
              </p>
            </div>

            <ChevronDown size={20} />
          </div>
        </AppMenu>

        {currentToken?.symbol && (
          <div className="input-container">
            <input
              type="text"
              value={transferAmt}
              onChange={e => {
                const newValue = e.target.value;
                if (/^\d*\.?\d*$/.test(newValue)) {
                  setTransferAmt(newValue);
                }
              }}
              placeholder="Enter an amount"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceToken;
