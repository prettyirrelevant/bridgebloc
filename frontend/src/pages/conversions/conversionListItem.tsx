import millify from "millify";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { metadata } from "constants/data";
import ReactTimeAgo from "react-time-ago";
import { Path } from "@phosphor-icons/react";
import { capitalizeFirst } from "helpers/text";

interface ConversionListItemProps {
  data: any;
}

const ConversionListItem = ({ data }: ConversionListItemProps) => {
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
    <Link to={`/conversion/${data?.uuid}`} className="conversions-list__item">
      <div className="row">
        {/* <div /> */}
        {data?.created_at && !isNaN(Date.parse(data?.created_at)) && (
          <div className="block">
            <p className="time">
              <ReactTimeAgo
                date={Date.parse(data?.created_at)}
                locale="en-US"
              />
            </p>
          </div>
        )}
      </div>

      <div className="row">
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

      <div className="row">
        <div className="token">
          <div className="token-img">
            <img
              alt={data?.source_token?.name}
              src={data?.source_token?.image_url}
            />
          </div>
          <p>
            {millify(data?.amount ?? 0, {
              precision: 2,
            })}
          </p>
          <p
            className="token-name"
            style={{
              textTransform: "uppercase",
            }}
          >
            {data?.source_token?.symbol?.split("_").join(" ")}
          </p>
        </div>

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

      <div className="row">
        <div className="token">
          <p className="token-name">
            <Path size={16} />
            {capitalizeFirst(data?.conversion_type?.split("_").join(" ") ?? "")}
          </p>
        </div>

        <p
          className={`indicator indicator-${
            data?.conversion_steps?.[data?.conversion_steps?.length - 1]
              ?.status ?? "pending"
          }`}
        >
          {data?.conversion_steps?.[data?.conversion_steps?.length - 1]
            ?.status ?? "pending"}
        </p>
      </div>
    </Link>
  );
};

export default ConversionListItem;
