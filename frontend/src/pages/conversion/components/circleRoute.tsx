import axios from "axios";
import { useMemo } from "react";
import { useApp } from "context/AppContext";
import { useParams } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { BarLoader, ClipLoader } from "react-spinners";
import { erc20ABI, useNetwork, useSwitchNetwork } from "wagmi";
import {
  useAccount,
  useSignMessage,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";

const processing = ["pending", "failed"];

interface CircleRouteProps {
  data: any;
  dataError: unknown;
  refetch: () => void;
  dataLoading: boolean;
}

const CircleRoute = ({
  data,
  refetch,
  dataError,
  dataLoading,
}: CircleRouteProps) => {
  let { uuid } = useParams();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { authorization, setAuthorization } = useApp();

  // Sign message to verify address
  const { signMessageAsync, isLoading } = useSignMessage({
    message:
      "Message: Welcome to BridgeBloc!\nURI: https://bridgebloc.vercel.app",
  });

  // Prepare txn object to transfer to deposit address
  const { config } = usePrepareContractWrite({
    abi: erc20ABI,
    functionName: "transfer",
    args: [
      data?.conversion_steps?.[0]?.metadata?.paymentMethods?.[0]?.address,
      BigInt(
        Number(data?.amount ?? 0) *
          Math.pow(10, Number(data?.source_token?.decimals ?? 0))
      ),
    ],
    chainId: data?.source_chain,
    address: data?.source_token?.address,
    enabled: !!data?.source_token?.address && !!data?.amount,
  });

  const { writeAsync, isLoading: loading } = useContractWrite(config);

  // Suggest transaction to user and send txn hash
  const composeTxn = async (signature: string) => {
    try {
      const txn = await writeAsync?.();

      if (txn?.hash)
        await axios.patch(
          `conversions/circle-api/${uuid}/add-deposit-hash`,
          {
            tx_hash: txn?.hash,
          },
          {
            headers: {
              Authorization: `Signature ${address}:${signature}`,
            },
          }
        );

      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  // Confirm details to process payment
  const startPayment = async () => {
    if (!address) return;
    try {
      if (chain?.id !== data?.source_chain)
        await switchNetworkAsync?.(data?.source_chain);

      if (address !== authorization?.address || !authorization?.signature) {
        const signature = await signMessageAsync();
        if (signature) {
          setAuthorization({
            address,
            signature,
          });
          await composeTxn(signature);
        } else return;
      } else {
        await composeTxn(authorization?.signature);
      }
    } catch (error) {
      // @ts-ignore
      console.log(error?.message);
    }
  };

  // Bridging stages
  const stepOne = useMemo(() => {
    return data?.conversion_steps
      ? data?.conversion_steps?.[0]?.status
      : "pending";
  }, [data]);

  const stepTwo = useMemo(() => {
    return data?.conversion_steps
      ? data?.conversion_steps?.[1]?.metadata?.deposit_tx_hash
        ? "success"
        : "pending"
      : "pending";
  }, [data]);

  const stepThree = useMemo(() => {
    return data?.conversion_steps
      ? data?.conversion_steps?.[1]?.status
      : "pending";
  }, [data]);

  const finalStep = useMemo(() => {
    return data?.conversion_steps
      ? data?.conversion_steps?.[2]?.status ?? "pending"
      : "pending";
  }, [data]);

  return (
    <>
      <div className="timeline">
        {[1, 2, 3, 4, 5].map((item, index) => {
          return (
            <div
              key={index}
              data-active={
                index <=
                (processing.includes(stepOne)
                  ? 0
                  : processing.includes(stepTwo)
                  ? 1
                  : processing.includes(stepThree)
                  ? 2
                  : processing.includes(finalStep)
                  ? 3
                  : 4)
              }
              className="timeline-item"
            >
              {item}
            </div>
          );
        })}

        <div className="timeline-cover">
          <div
            className="timeline-line"
            data-index={
              processing.includes(stepOne)
                ? 0
                : processing.includes(stepTwo)
                ? 1
                : processing.includes(stepThree)
                ? 2
                : processing.includes(finalStep)
                ? 3
                : 4
            }
          />
        </div>
      </div>

      <div className="conversion-options">
        {dataLoading || dataError ? (
          <div className="step-message">
            <p className="title">
              {dataError ? (
                // @ts-ignore
                <>{dataError?.response?.data?.errors?.[0]}</>
              ) : (
                <>Fetching transaction details</>
              )}
            </p>
            {dataLoading && <BarLoader color={"#999"} />}
          </div>
        ) : (
          <>
            {processing.includes(stepOne) ? (
              <div className="step-message">
                <p className="title">
                  Hold on! we are creating a deposit address
                </p>
                <BarLoader color={"#999"} />
              </div>
            ) : processing.includes(stepTwo) ? (
              <button
                className="primary-btn"
                style={{
                  marginTop: "20px",
                }}
                onClick={() => startPayment()}
              >
                Pay {data?.amount}
                <span style={{ textTransform: "uppercase" }}>
                  {data?.source_token?.symbol?.split("_").join(" ")}
                </span>
                {(loading || isLoading) && (
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
            ) : processing.includes(stepThree) ? (
              <div className="step-message">
                <p
                  className="title"
                  style={{
                    lineHeight: 1.8,
                  }}
                >
                  Wating for your deposit to be confirmed
                  <br />
                  Might take a while... ⏳
                </p>
                <BarLoader color={"#999"} />
              </div>
            ) : processing.includes(finalStep) ? (
              <div className="step-message">
                <p
                  className="title"
                  style={{
                    lineHeight: 1.8,
                  }}
                >
                  Sending funds to the receipient address
                </p>
                <BarLoader color={"#999"} />
              </div>
            ) : (
              <>
                <div
                  className="step-message"
                  style={{
                    gap: 7,
                    padding: "0px",
                  }}
                >
                  <div
                    style={{
                      gap: 7,
                      flexDirection: "row",
                    }}
                  >
                    <p
                      className="title"
                      style={{
                        fontSize: "18px",
                      }}
                    >
                      Successful
                    </p>
                    <CheckCircle size={20} weight="fill" color="#0FFF7F" />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CircleRoute;
