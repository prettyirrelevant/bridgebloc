import {
  erc20ABI,
  useAccount,
  useNetwork,
  useSignMessage,
  usePublicClient,
  useContractRead,
  useSwitchNetwork,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';
import { fromBytes, toBytes } from 'viem';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { metadata } from 'constants/data';
import { useApp } from 'context/AppContext';
import { ClipLoader } from 'react-spinners';
import { useNetworkState } from 'react-use';
import { getDomain } from 'helpers/contract';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { crossChainBridgeAbi } from 'contracts/index';
import { networkContracts } from 'contracts/addresses';
import { evmAddressToBytes32 } from 'utils/address';

interface ConversionPayload {
  address: string;
  signature: string;
  data: {
    [key: string]: any;
  };
}

const CctpTxnBtn = () => {
  const { chain } = useNetwork();
  const navigate = useNavigate();
  const { address } = useAccount();
  const onlineState = useNetworkState();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [confirmingTxn, setConfirmingTxn] = useState(false);

  const {
    transferAmt,
    currentChain,
    currentToken,
    currentRoute,
    authorization,
    destinationToken,
    setAuthorization,
  } = useApp();

  const publicClient = usePublicClient({
    chainId: Number(metadata?.[currentChain]?.chain_id),
  });

  const { signMessageAsync, isLoading } = useSignMessage({
    message:
      'Message: Welcome to BridgeBloc!\nURI: https://bridgebloc.vercel.app',
  });

  const getDepositContract = () =>
    networkContracts[currentChain] as `0x${string}`;

  /**
   * Prepare txn to approve allowance (max amount that can be spent)
   */
  const { config: approveConfig } = usePrepareContractWrite({
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      getDepositContract(),
      BigInt(
        Number(transferAmt ?? 0) *
          Math.pow(10, Number(currentToken?.decimals ?? 0)),
      ),
    ],
    chainId: Number(metadata?.[currentChain]?.chain_id),
    address: currentToken.address as `0x${string}`,
    enabled:
      !!currentToken?.address &&
      !isNaN(Number(transferAmt)) &&
      Number(transferAmt) > 0,
  });

  // Prompt user to set allowance
  const { isLoading: approving, writeAsync: approveAsync } =
    useContractWrite(approveConfig);

  /**
   * Read the contract to confirm if the allowed amount is greated than the txn amount
   */
  const { refetch: refetchApprovedAmount, data: approvedAmount } =
    useContractRead({
      abi: erc20ABI,
      functionName: 'allowance',
      args: [address as `0x${string}`, getDepositContract()],
      chainId: Number(metadata?.[currentChain]?.chain_id),
      address: currentToken.address as `0x${string}`,
    });

  /**
   * Prepare txn to send tokens
   */
  const { config } = usePrepareContractWrite({
    ...crossChainBridgeAbi,
    functionName: 'deposit',
    args: [
      BigInt(
        Number(transferAmt) * Math.pow(10, Number(currentToken?.decimals ?? 0)),
      ),
      currentToken?.address as `0x${string}`,
      0, // hardcoding fee here since it's testnet
      evmAddressToBytes32(destinationToken?.address),
      getDomain(currentRoute?.chain) as number,
      evmAddressToBytes32(address),
      evmAddressToBytes32(getDepositContract()),
    ],
    chainId: Number(metadata?.[currentChain]?.chain_id),
    address: getDepositContract(),
    enabled: false
      // !!currentToken?.address &&
      // address &&
      // destinationToken?.address &&
      // !isNaN(Number(transferAmt)) &&
      // Number(transferAmt) > 0,
  });

  // Prompt user to approve tokens transfer txn
  const { writeAsync, isLoading: depositLoading } = useContractWrite(config);

  /**
   * Send txn-hash to the server
   */
  const cctpConversion = useMutation({
    mutationFn: async (payload: ConversionPayload) => {
      return await axios
        .post(`/conversions/cctp`, payload?.data, {
          headers: {
            Authorization: `Signature ${payload?.address}:${payload?.signature}`,
          },
        })
        .then((response) => response?.data?.data);
    },
    onSuccess: (data) => {
      navigate(`/conversion/${data?.id}`);
    },
  });

  const processConversion = async () => {
    if (
      isLoading ||
      approving ||
      confirmingTxn ||
      depositLoading ||
      cctpConversion.isLoading
    )
      return;

    if (!address || !onlineState.online) return;

    if (
      !address ||
      !currentChain ||
      !currentRoute?.chain ||
      !currentToken?.address ||
      !destinationToken?.address ||
      isNaN(Number(transferAmt))
    )
      return;

    try {
      const authData = {
        address: authorization.address || address,
        signature: authorization.signature || (await signMessageAsync()) || '',
      };

      if (authData?.signature !== authorization?.signature)
        setAuthorization(authData);

      const shouldSwitchNetwork =
        chain?.id !== Number(metadata?.[currentChain]?.chain_id);
      if (shouldSwitchNetwork) {
        await switchNetworkAsync?.(Number(metadata?.[currentChain]?.chain_id));
      }

      if (
        Number(approvedAmount) <
        BigInt(
          Number(transferAmt) *
            Math.pow(10, Number(currentToken?.decimals ?? 0)),
        )
      ) {
        await approveAsync?.();
        refetchApprovedAmount();
      }

      const txn = await writeAsync?.();

      if (txn?.hash) {
        setConfirmingTxn(true);
        await publicClient.waitForTransactionReceipt({
          hash: txn?.hash,
        });

        setConfirmingTxn(!true);

        cctpConversion.mutate({
          address: authData.address,
          signature: authData.signature,
          data: {
            tx_hash: txn?.hash,
            source_chain: currentChain,
            destination_chain: currentRoute.chain,
          },
        });
      }
    } catch (error: any) {
      console.log(error?.message);
    } finally {
      setConfirmingTxn(false);
    }
  };

  return (
    <button
      className="primary-btn"
      style={{
        marginTop: '10px',
      }}
      onClick={processConversion}
    >
      Continue
      {(cctpConversion.isLoading ||
        isLoading ||
        confirmingTxn ||
        approving ||
        depositLoading) && (
        <ClipLoader
          size={16}
          color={'#888'}
          cssOverride={{
            right: 20,
            position: 'absolute',
          }}
          aria-label="Loading Spinner"
        />
      )}
    </button>
  );
};

export default CctpTxnBtn;
