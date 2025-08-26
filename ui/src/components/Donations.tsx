import { Col, Row } from "antd";
import BtnCopy from "./BtnCopy";
import { useTranslation } from "react-i18next";


const donations: {
  chainName: string,
  address: string
}[] = [
    {
      chainName: 'Bitcoin',
      address: 'bc1qe6fetuymcz0xruduhnxkz5tmael8lgg7tmgp0p'
    },
    {
      chainName: 'USDT (TRC20)',
      address: 'TXPYCeV8EHB8r7kG5PECPGc8NUou3AkUAR'
    },
    {
      chainName: 'TON (The Open Network)',
      address: 'EQAxEGqQYehBYv3Yz9WgBF25NfbSv6Mpo8rYHoAe01fCwc_2'
    },
    {
      chainName: 'BNB Chain',
      address: '0xC1c6f942838D5865918795E7Fa63C6897a3d5757'
    },
    {
      chainName: 'Solana',
      address: 'BMiSYg295gkJ3c2SXLng9qyaXb3nbmrqbtGU8spKGpTD'
    },
    {
      chainName: 'Ethereum',
      address: '0xC1c6f942838D5865918795E7Fa63C6897a3d5757'
    },
    {
      chainName: 'Cosmos',
      address: 'cosmos1cgqs7t0xm7jl46hucau2hqp4smmsppg2qw7wd5'
    },

  ];


export const Donations = () => {
  const { t } = useTranslation();

  return (<>

    <h3>{t("Donations")}:</h3>
    <Row justify="center" className="footer-donations" gutter={24}>

      {donations.map((w, idx) => (
        <Col key={w.chainName + idx} className='footer-donations-address' xs={24} sm={12} md={8} lg={6} xl={4} style={{ marginBottom: 16 }}>
          <h4>{w.chainName}: <BtnCopy value={w.address} /></h4>

          <span style={{
            userSelect: 'all',
            display: 'inline-block',
            maxWidth: '100%',
            wordBreak: 'break-all',
            overflowWrap: 'break-word'
          }}>
            {w.address}
          </span>

        </Col>
      ))}

    </Row>
  </>)
}
export default Donations;