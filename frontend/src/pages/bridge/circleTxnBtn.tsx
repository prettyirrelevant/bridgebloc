import axios from "axios";
import { useApp } from "context/AppContext";
import { ClipLoader } from "react-spinners";
import { useNetworkState } from "react-use";
import { useNavigate } from "react-router-dom";
import { useAccount, useSignMessage } from "wagmi";
import { useMutation } from "@tanstack/react-query";

interface ConversionPayload {
  address: string;
  signature: string;
}

const CircleTxnBtn = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const onlineState = useNetworkState();

  const {
    transferAmt,
    currentChain,
    currentToken,
    currentRoute,
    authorization,
    destinationToken,
    setAuthorization,
  } = useApp();

  const { signMessageAsync, isLoading } = useSignMessage({
    message:
      "Message: Welcome to BridgeBloc!\nURI: https://bridgebloc.vercel.app",
  });

  /**
   * Send conversion request to the server
   */
  const circleConversion = useMutation({
    mutationFn: async (payload: ConversionPayload) => {
      return await axios
        .post(
          `/conversions/circle-api`,
          {
            source_chain: currentChain,
            destination_address: address,
            source_token: currentToken?.address,
            destination_chain: currentRoute?.chain,
            destination_token: destinationToken?.address,
            amount: isNaN(Number(transferAmt)) ? 0 : Number(transferAmt),
          },
          {
            headers: {
              Authorization: `Signature ${payload?.address}:${payload?.signature}`,
            },
          }
        )
        .then(response => response?.data?.data);
    },
    onSuccess: data => {
      navigate(`/conversion/${data?.id}`);
    },
  });

  const processConversion = async () => {
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
        signature: authorization.signature || (await signMessageAsync()) || "",
      };

      if (authData?.signature !== authorization?.signature)
        setAuthorization(authData);
      circleConversion.mutate({
        address: authData.address,
        signature: authData.signature,
      });
    } catch (error: any) {
      console.log(error?.message);
    }
  };

  return (
    <button
      className="primary-btn"
      style={{
        marginTop: "10px",
      }}
      onClick={processConversion}
    >
      Continue
      {(circleConversion.isLoading || isLoading) && (
        <ClipLoader
          size={16}
          color={"#888"}
          cssOverride={{
            right: 20,
            position: "absolute",
          }}
          aria-label="Loading Spinner"
        />
      )}
    </button>
  );
};

export default CircleTxnBtn;
