import { useMemo } from "react";
import { metadata } from "constants/data";
import { capitalizeFirst } from "helpers/text";
import dayjs from "dayjs";

interface ConversionDetailsProps {
  data: any;
}

const ConversionDetails = ({ data }: ConversionDetailsProps) => {
  const chainIcons = useMemo(() => {
    const selected = Object.values(metadata).filter(
      (item: any) =>
        item.chain_id === data?.source_chain + "" ||
        item.chain_id === data?.destination_chain + ""
    );

    return {
      [data?.source_chain]: selected.find(
        (item: any) => item.chain_id === data?.source_chain + ""
      ),
      [data?.destination_chain]: selected.find(
        (item: any) => item.chain_id === data?.destination_chain + ""
      ),
    };
  }, [data?.source_chain, data?.destination_chain]);

  return (
    <div className="conversion-details">
      <div className="conversion-details-item">
        <p className="title">Source chain</p>

        <div className="token">
          <div className="token-img">
            <img
              src={chainIcons?.[data?.source_chain]?.image_url}
              alt={chainIcons?.[data?.source_chain]?.chain_name}
            />
          </div>
          <p className="token-name">
            {capitalizeFirst(
              chainIcons?.[data?.source_chain]?.chain_name
                ?.split("_")
                .join(" ") ?? ""
            )}
          </p>
        </div>
      </div>

      <div className="conversion-details-item">
        <p className="title">Destination chain</p>

        <div className="token">
          <div className="token-img">
            <img
              src={chainIcons?.[data?.destination_chain]?.image_url}
              alt="eth"
            />
          </div>
          <p className="token-name">
            {capitalizeFirst(
              chainIcons?.[data?.destination_chain]?.chain_name
                ?.split("_")
                .join(" ") ?? ""
            )}
          </p>
        </div>
      </div>

      <div className="conversion-details-item">
        <p className="title">Source token</p>

        <div className="token">
          <div className="token-img">
            <img
              alt={data?.source_token?.name}
              src={data?.source_token?.image_url}
            />
          </div>
          <p
            className="token-name"
            style={{
              textTransform: "uppercase",
            }}
          >
            {data?.source_token?.symbol?.split("_").join(" ")}
          </p>
        </div>
      </div>

      <div className="conversion-details-item">
        <p className="title">Destination token</p>

        <div className="token">
          <div className="token-img">
            <img
              alt={data?.destination_token?.name}
              src={data?.destination_token?.image_url}
            />
          </div>
          <p
            className="token-name"
            style={{
              textTransform: "uppercase",
            }}
          >
            {data?.destination_token?.symbol?.split("_").join(" ")}
          </p>
        </div>
      </div>

      <div className="conversion-details-item">
        <p className="title">Amount</p>

        <div className="token">
          <p
            className="token-name"
            style={{
              textTransform: "uppercase",
            }}
          >
            {data?.amount} {data?.source_token?.symbol?.split("_").join(" ")}
          </p>
        </div>
      </div>

      <div className="conversion-details-item">
        <p className="title">Conversion type</p>

        <div className="token">
          <p
            className="token-name"
            style={{
              textTransform: "capitalize",
            }}
          >
            {data?.conversion_type === "cctp"
              ? "CCTP"
              : data?.conversion_type?.split("_").join(" ")}
          </p>
        </div>
      </div>

      <div className="conversion-details-item">
        <p className="title">Created</p>

        <div className="token">
          <p
            className="token-name"
            style={{
              textTransform: "capitalize",
            }}
          >
            {isNaN(Date.parse(data?.created_at)) ? (
              <></>
            ) : (
              dayjs(Date.parse(data?.created_at)).format("MMM DD, HH:mm")
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversionDetails;
