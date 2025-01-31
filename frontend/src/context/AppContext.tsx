import {
  useMemo,
  type Dispatch,
  useState,
  type ReactNode,
  useEffect,
  useContext,
  type ReactElement,
  createContext,
  type SetStateAction,
} from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { metadata, tokens } from 'constants/data';

interface AppProviderProps {
  children: ReactElement | ReactElement[] | ReactNode;
}

interface AppContextType {
  routes: any;
  chainIcon: string;
  currentToken: any;
  chainTokens: any[];
  chainRoutes: any[];
  currentRoute: any;
  transferAmt: string;
  currentChain: string;
  receivedValue: string;
  destinationToken: any;
  authorization: {
    address: string;
    signature: string;
  };

  currentNetworkTokens: any[];
  setCurrentToken: Dispatch<SetStateAction<any>>;
  setAuthorization: Dispatch<SetStateAction<any>>;
  setTransferAmt: Dispatch<SetStateAction<string>>;
  setCurrentRoute: Dispatch<SetStateAction<string>>;
  setCurrentChain: Dispatch<SetStateAction<string>>;
  setDestinationToken: Dispatch<SetStateAction<any>>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = (): AppContextType => useContext(AppContext);

export type QuotesPayload = {
  address: string;
  signature: string;
  data?: {
    [key: string]: any;
  };
};

const AppProvider = ({ children }: AppProviderProps) => {
  const { address } = useAccount();
  const [authorization, setAuthorization] = useState({
    address: '',
    signature: '',
  });

  const [transferAmt, setTransferAmt] = useState('');
  const [currentRoute, setCurrentRoute] = useState<any>({});
  const [destinationToken, setDestinationToken] = useState<any>({});
  const [currentChain, setCurrentChain] = useState('base_testnet');
  const [currentToken, setCurrentToken] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    setCurrentRoute('cctp');

    const auth = localStorage.getItem('authorization');
    if (auth) setAuthorization(JSON.parse(auth));
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem('authorization');

    if (auth) {
      if (
        JSON.parse(auth ?? '')?.signature &&
        address === (JSON.parse(auth ?? '')?.address as `0x${string}`)
      ) {
        setAuthorization({
          address,
          signature: JSON.parse(auth ?? '')?.signature,
        });
      }
    } else
      setAuthorization({
        address: '',
        signature: '',
      });
  }, [address]);

  useEffect(() => {
    if (authorization.address && authorization.signature)
      localStorage.setItem('authorization', JSON.stringify(authorization));
  }, [authorization]);

  const conversions = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      return await axios
        .get('conversions/routes')
        .then((response) => response?.data?.data);
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const routes = useMemo(() => {
    const routesArr = Object.keys(conversions.data || {});
    return routesArr
      ?.filter((chain) => chain.includes('testnet'))
      ?.map((chain) => {
        return {
          chain,
          image_url: metadata?.[chain]?.image_url ?? '',
        };
      });
  }, [conversions.data]);

  const chainRoutes = useMemo(() => {
    const routesArr = conversions.data?.[currentChain];
    return Object.keys(routesArr || {}).map((chain) => {
      return {
        chain,
        route: routesArr?.[chain] ?? '',
        image_url: metadata?.[chain]?.image_url ?? '',
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChain]);

  const chainIcon = useMemo(() => {
    return metadata?.[currentChain]?.image_url ?? '';
  }, [currentChain]);

  const chainTokens = useMemo(() => {
    return tokens.filter((token) => token.chain_name === currentChain);
  }, [currentChain]);

  const receivedValue = useMemo(() => {
    return (
      isNaN(Number(transferAmt)) ? 0 : Number(transferAmt) * 0.926781
    ).toFixed(4);
  }, [transferAmt]);

  const currentNetworkTokens = useMemo(() => {
    return tokens.filter((token) => token.chain_name === currentRoute?.chain);
  }, [currentRoute]);

  return (
    <AppContext.Provider
      value={{
        routes,
        chainIcon,
        chainTokens,
        chainRoutes,
        transferAmt,
        currentRoute,
        currentChain,
        currentToken,
        receivedValue,
        setTransferAmt,
        setCurrentToken,
        setCurrentRoute,
        setCurrentChain,
        destinationToken,
        setDestinationToken,
        currentNetworkTokens,

        authorization,
        setAuthorization,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
