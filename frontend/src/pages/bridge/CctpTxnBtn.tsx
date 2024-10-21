import {
  useClient,
  useAccount,
  useSignMessage,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useSimulateContract,
} from 'wagmi';
import axios from 'axios';
import { toast } from 'sonner';
import { erc20Abi } from 'viem';
import { useState } from 'react';
import { metadata } from 'constants/data';
import { useApp } from 'context/AppContext';
import { ClipLoader } from 'react-spinners';
import { useNetworkState } from 'react-use';
import { getDomain } from 'helpers/contract';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { evmAddressToBytes32 } from 'utils/address';
import { crossChainBridgeAbi } from 'contracts/index';
import { networkContracts } from 'contracts/addresses';
import { waitForTransactionReceipt } from '@wagmi/core';

import { config } from '../../wagmi-setup';

interface ConversionPayload {
  address: string;
  signature: string;
  data: {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any;
  };
}

const CctpTxnBtn = () => {
  const navigate = useNavigate();
  const { address, chain } = useAccount();
  const onlineState = useNetworkState();
  const { switchChainAsync } = useSwitchChain();
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

  const client = useClient({
    chainId: Number(metadata?.[currentChain]?.chain_id),
  });

  const { signMessageAsync, isPending } = useSignMessage();

  const getDepositContract = () =>
    networkContracts[currentChain] as `0x${string}`;

  /**
   * Prepare txn to approve allowance (max amount that can be spent)
   */
  const { data: approveData } = useSimulateContract({
    abi: erc20Abi,
    functionName: 'approve',
    args: [
      getDepositContract(),
      BigInt(
        Number(transferAmt ?? 0) * 10 ** Number(currentToken?.decimals ?? 0),
      ),
    ],
    chainId: Number(metadata?.[currentChain]?.chain_id),
    address: currentToken.address as `0x${string}`,
  });

  // Prompt user to set allowance
  const { isPending: approving, writeContractAsync: approveAsync, isError: isApproveError, error: approveError } =
    useWriteContract();

  /**
   * Read the contract to confirm if the allowed amount is greated than the txn amount
   */
  const { refetch: refetchApprovedAmount, data: approvedAmount } =
    useReadContract({
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address as `0x${string}`, getDepositContract()],
      chainId: Number(metadata?.[currentChain]?.chain_id),
      address: currentToken.address as `0x${string}`,
    });

  /**
   * Prepare txn to send tokens
   */
  const { data: depositData } = useSimulateContract({
    ...crossChainBridgeAbi,
    functionName: 'deposit',
    args: [
      BigInt(Number(transferAmt) * 10 ** Number(currentToken?.decimals ?? 0)),
      currentToken?.address as `0x${string}`,
      0, // hardcoding fee here since it's testnet
      evmAddressToBytes32(destinationToken?.address),
      getDomain(currentRoute?.chain) as number,
      evmAddressToBytes32(address),
      evmAddressToBytes32(getDepositContract()),
    ],
    chainId: Number(metadata?.[currentChain]?.chain_id),
    address: getDepositContract(),
  });

  // Prompt user to approve tokens transfer txn
  const { writeContractAsync: depositAsync, isPending: depositLoading, error: depositError, isError: isDepositError } = useWriteContract();

  /**
   * Send txn-hash to the server
   */
  const cctpConversion = useMutation({
    mutationFn: async (payload: ConversionPayload) => {
      return await axios
        .post('/conversions/cctp', payload?.data, {
          headers: {
            Authorization: `Signature ${payload?.address}:${payload?.signature}`,
          },
        })
        .then((response) => response?.data?.data);
    },
    onSuccess: (data) => {
      navigate(`/conversion/${data?.id}`);
    },
    onError(error, variables, context) {
      toast.error(JSON.stringify(error));
    },
  });

  const processConversion = async () => {
    if (
      isPending ||
      approving ||
      confirmingTxn ||
      depositLoading ||
      cctpConversion.isPending
    )
      return;

    if (!address || !onlineState.online) return;

    if (
      !address ||
      !currentChain ||
      !currentRoute?.chain ||
      !currentToken?.address ||
      !destinationToken?.address ||
      Number.isNaN(transferAmt)
    )
      return;

    try {
      const authData = {
        address: authorization.address || address,
        signature:
          authorization.signature ||
          (await signMessageAsync({
            message:
              'Message: Welcome to BridgeBloc!\nURI: https://bridgebloc.vercel.app',
          })) ||
          '',
      };

      if (authData?.signature !== authorization?.signature)
        setAuthorization(authData);

      const shouldSwitchNetwork =
        chain?.id !== Number(metadata?.[currentChain]?.chain_id);
      if (shouldSwitchNetwork) {
        await switchChainAsync?.({
          chainId: Number(metadata?.[currentChain]?.chain_id),
        });
      }

      if (
        Number(approvedAmount) <
        BigInt(Number(transferAmt) * 10 ** Number(currentToken?.decimals ?? 0))
      ) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        await approveAsync(approveData!.request);
        if (isApproveError){
          toast.error(approveError.message)
          return
        }

        refetchApprovedAmount();
      }

      if (isDepositError) {
        toast.error(depositError.message)
        return
      }

      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const txn = await depositAsync(depositData!.request);

      if (txn) {
        setConfirmingTxn(true);
        await waitForTransactionReceipt(config, { hash: txn });
        setConfirmingTxn(!true);

        cctpConversion.mutate({
          address: authData.address,
          signature: authData.signature,
          data: {
            tx_hash: txn,
            source_chain: currentChain,
            destination_chain: currentRoute.chain,
          },
        });
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      console.log(error?.message);
      toast.error(error?.message);
    } finally {
      setConfirmingTxn(false);
    }
  };

  return (
    <button
      type="button"
      className="primary-btn"
      style={{
        marginTop: '10px',
      }}
      onClick={processConversion}
    >
      Continue
      {(cctpConversion.isPending ||
        isPending ||
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
