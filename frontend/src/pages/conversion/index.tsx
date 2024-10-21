import axios from 'axios';
import { useAccount } from 'wagmi';
import { useApp } from 'context/AppContext';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import ConversionDetails from './conversionDetails';
import CctpRoute from './components/cctpRoute';

const Conversion = () => {
  const { uuid } = useParams();
  const { address } = useAccount();
  const { authorization } = useApp();

  const {
    data,
    refetch,
    error: dataError,
    isLoading: dataLoading,
  } = useQuery({
    queryKey: [
      'conversion',
      uuid,
      authorization?.address,
      authorization?.signature,
    ],
    queryFn: async () => {
      return await axios
        .get(`conversions/${uuid}`, {
          headers: {
            Authorization: `Signature ${authorization?.address}:${authorization?.signature}`,
          },
        })
        .then((response) => response?.data?.data);
    },
    refetchInterval: 30000,
    enabled:
      !!uuid &&
      authorization?.address === address &&
      !!authorization?.signature,
  });

  return (
    <div className="conversion-page">
      <div className="conversion-container">
        <div className="conversion">
          <div className="conversion-header">
            <p className="title">Transaction Status</p>
            <p className="subtitle">
              Below is the current status of this bridge activity.
            </p>
          </div>

          <ConversionDetails data={data} />

          {data?.conversion_type === 'cctp' ? (
            <CctpRoute
              data={data}
              dataError={dataError}
              dataLoading={dataLoading}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Conversion;
