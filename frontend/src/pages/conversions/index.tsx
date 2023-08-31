import axios from "axios";
import { useAccount } from "wagmi";
import { BarLoader } from "react-spinners";
import { useApp } from "context/AppContext";
import { useQuery } from "@tanstack/react-query";
import ConversionListItem from "./conversionListItem";

const Conersions = () => {
  const { address } = useAccount();
  const { authorization } = useApp();

  const { data, error, isLoading } = useQuery(
    ["conversions", authorization?.address, authorization?.signature],
    async () => {
      return await axios
        .get(`conversions`, {
          headers: {
            Authorization: `Signature ${authorization?.address}:${authorization?.signature}`,
          },
        })
        .then(response => response?.data?.data);
    },
    {
      enabled: authorization?.address === address && !!authorization?.signature,
    }
  );

  return (
    <div className="conversions-page">
      <div className="conversions-container">
        <div className="conversions">
          <div className="conversions-header">
            <p className="title">Your Conversions</p>
            <p className="subtitle">View your conversions across networks.</p>
          </div>

          <div className="conversions-list">
            {isLoading || error ? (
              <>
                <div className="status-message">
                  <p className="title">
                    {error ? (
                      // @ts-ignore
                      <>{error?.response?.data?.errors?.[0]}</>
                    ) : (
                      <>Fetching conversions</>
                    )}
                  </p>
                  {isLoading && <BarLoader color={"#999"} />}
                </div>
              </>
            ) : (
              <>
                {data?.map((item: any, index: number) => {
                  return <ConversionListItem key={index} data={item} />;
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conersions;
