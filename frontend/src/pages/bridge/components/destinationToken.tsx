import useAppMenu from "hooks/useAppMenu";
import { ChevronDown } from "lucide-react";
import { useApp } from "context/AppContext";
import { capitalizeFirst } from "helpers/text";

const DestinationToken = () => {
  const { destinationToken, setDestinationToken, currentNetworkTokens } =
    useApp();

  const [AppMenu] = useAppMenu({
    items: currentNetworkTokens,
    isObject: true,
    setDefault: true,
    objectKeys: {
      name: "symbol",
      img: "image_url",
    },
    defaultOption: null,
    onOptionChange: (option: any) => {
      setDestinationToken(
        currentNetworkTokens.find(token => token.symbol === option) ?? {}
      );
    },
  });

  return (
    <div className="bridge-block">
      <p className="bridge-block__title">Destination token</p>

      <AppMenu align="center" capitals>
        <div
          className="bridge-block__btn"
          style={{
            cursor: "pointer",
          }}
        >
          <div className="bridge-block__btn-token">
            <div className="token-img">
              {destinationToken?.image_url && (
                <img
                  src={destinationToken?.image_url}
                  alt={destinationToken?.symbol ?? "eth"}
                />
              )}
            </div>
            <p
              className="token-name"
              style={{
                textTransform: "uppercase",
              }}
            >
              {destinationToken?.symbol
                ? capitalizeFirst(
                    destinationToken?.symbol?.split("_").join(" ")
                  )
                : ""}
            </p>
          </div>

          <ChevronDown size={20} />
        </div>
      </AppMenu>
    </div>
  );
};

export default DestinationToken;
