import { useMemo } from "react";
import { BarLoader } from "react-spinners";
import { CheckCircle } from "@phosphor-icons/react";

const processing = ["pending", "failed"];

interface CctpRouteProps {
  data: any;
  dataError: unknown;
  dataLoading: boolean;
}

const CctpRoute = ({ data, dataError, dataLoading }: CctpRouteProps) => {
  const stepOne = useMemo(() => {
    return data?.conversion_steps
      ? data?.conversion_steps?.[0]?.status
      : "pending";
  }, [data]);

  const stepTwo = useMemo(() => {
    return data?.conversion_steps
      ? data?.conversion_steps?.[1]?.status ?? "pending"
      : "pending";
  }, [data]);

  return (
    <>
      <div className="timeline">
        {[1, 2, 3].map((item, index) => {
          return (
            <div
              key={index}
              data-active={
                index <=
                (processing.includes(stepOne)
                  ? 0
                  : processing.includes(stepTwo)
                  ? 1
                  : 2)
              }
              className="timeline-item"
            >
              {item}
            </div>
          );
        })}

        <div className="timeline-cover">
          <div
            className="timeline-line cctp"
            data-index={
              processing.includes(stepOne)
                ? 0
                : processing.includes(stepTwo)
                ? 1
                : 2
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
                  Waiting for confirmation from attestation service
                </p>
                <BarLoader color={"#999"} />
              </div>
            ) : processing.includes(stepTwo) ? (
              <div className="step-message">
                <p
                  className="title"
                  style={{
                    lineHeight: 1.8,
                  }}
                >
                  Sending funds to the receipient address
                  <br />
                  Might take a while... ⏳
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

export default CctpRoute;
