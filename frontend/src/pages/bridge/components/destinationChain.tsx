import { useApp } from "context/AppContext";
import { capitalizeFirst } from "helpers/text";
import useAppMenu from "hooks/useAppMenu";
import { ChevronDown } from "lucide-react";

const DestinationChain = () => {
  const { chainRoutes, setCurrentRoute, currentRoute } = useApp();

  const [AppMenu] = useAppMenu({
    items: chainRoutes,
    isObject: true,
    setDefault: true,
    defaultOption: currentRoute,
    onOptionChange: (option: any) => {
      setCurrentRoute(chainRoutes.find(route => route.chain === option) ?? {});
    },
  });

  return (
    <div className="bridge-block">
      <p className="bridge-block__title">To this network</p>

      <AppMenu>
        <button className="bridge-block__btn">
          <div className="bridge-block__btn-token">
            <div className="token-img">
              {currentRoute?.image_url && (
                <img
                  src={currentRoute?.image_url ?? "/images/avatar.png"}
                  alt={currentRoute?.chain ?? "eth"}
                />
              )}
            </div>
            <p className="token-name">
              {currentRoute?.chain
                ? capitalizeFirst(currentRoute?.chain?.split("_").join(" "))
                : "Select network"}
            </p>
          </div>

          <ChevronDown size={20} />
        </button>
      </AppMenu>
    </div>
  );
};

export default DestinationChain;
