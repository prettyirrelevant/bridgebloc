import { useApp } from "context/AppContext";
import { capitalizeFirst } from "helpers/text";
import useAppMenu from "hooks/useAppMenu";
import { ChevronDown } from "lucide-react";

const SourceChain = () => {
  const {
    routes,
    chainIcon,
    currentChain,
    setCurrentToken,
    setCurrentChain,
    setCurrentRoute,
    setDestinationToken,
  } = useApp();

  const [AppMenu] = useAppMenu({
    items: routes,
    isObject: true,
    setDefault: true,
    defaultOption: routes[0],
    onOptionChange: (option: any) => {
      setCurrentRoute("");
      setCurrentToken({});
      setCurrentChain(option);
      setDestinationToken({});
    },
  });

  return (
    <div className="bridge-block">
      <p className="bridge-block__title">From this network</p>

      <AppMenu>
        <div className="bridge-block__btn">
          <div className="bridge-block__btn-token">
            <div className="token-img">
              <img
                src={chainIcon ?? "/images/avatar.png"}
                alt={currentChain ?? "eth"}
              />
            </div>
            <p className="token-name">
              {capitalizeFirst(currentChain.split("_").join(" "))}
            </p>
          </div>

          <ChevronDown size={20} />
        </div>
      </AppMenu>
    </div>
  );
};

export default SourceChain;
