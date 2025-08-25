import { type FC, useRef, useState } from 'react';
import {
    Button,
    InputNumber,
    Table, type GetProp, type TableProps,
    Typography,
    Space,
    Input,
    Progress,
    Popover,
} from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { TronWeb, } from 'tronweb';
import { useTranslation } from 'react-i18next';
import { BtnCopy } from '../../components';
import { appContext } from '../../services';
import { sleep } from 'tronweb/utils';
import { TronGasFree, common } from '../../utils/tron/gasFree';


type ColumnsType<T extends object> = GetProp<TableProps<T>, 'columns'>;

interface Wallet {
    key: string;
    privateKey: string;
    address: string;
    gasFreeAddress?: `T${string}`;
    balance?: number;
    loadingBalance?: boolean;
}

const { Text } = Typography;
const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });

const tronGasFree = new TronGasFree({
    chainId: common.TRON_CHAIN_ID.MAINNET
});

const Tron: FC = () => {
    const { t } = useTranslation();

    const [amount, setAmount] = useState<number>(1_000);
    const [loading, setLoading] = useState(false);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [search, setSearch] = useState<string>('');
    const cancelRef = useRef(false);
    const refreshAllBalancesRef = useRef({
        isRefreshing: false, // tiến độ %
        progress: 0 // trạng thái đang chạy
    });


    const refreshBalance = async (wallet: Wallet) => {
        setWallets(prev =>
            prev.map(w =>
                w.key === wallet.key ? { ...w, loadingBalance: true } : w
            )
        );

        try {
            const balance = await tronWeb.trx.getBalance(wallet.address);

            setWallets(prev =>
                prev.map(w =>
                    w.key === wallet.key
                        ? { ...w, balance, loadingBalance: false }
                        : w
                )
            );
        } catch (error) {
            console.error(`Lỗi khi lấy số dư của ${wallet.address}`, error);
            appContext.message?.error('Lỗi lấy số dư');
            setWallets(prev =>
                prev.map(w =>
                    w.key === wallet.key ? { ...w, loadingBalance: false } : w
                )
            );
        }
    };

    const refreshAllBalances = async () => {
        cancelRef.current = false;
        const updated = [...wallets];
        const batchSize = 50;

        refreshAllBalancesRef.current.isRefreshing = true;
        refreshAllBalancesRef.current.progress = 0;

        // Đánh dấu tất cả loading
        setWallets((prev) => {
            prev.forEach((w) => {
                w.loadingBalance = true;
            });
            return [...prev];
        });
        setLoading(true);

        for (let i = 0; i < updated.length; i++) {
            if (cancelRef.current) {
                refreshAllBalancesRef.current.isRefreshing = false;
                setWallets(pre => {
                    pre.forEach(wallet => {
                        wallet.loadingBalance = false;
                    });
                    return [...pre];
                })
                break;
            }

            const w = updated[i];
            updated[i] = { ...w, loadingBalance: true };
            setWallets([...updated]);

            try {
                const sun = await tronWeb.trx.getBalance(w.address);
                updated[i] = { ...w, balance: sun, loadingBalance: false };
            } catch (error) {
                updated[i] = { ...w, loadingBalance: false };
            }

            setWallets([...updated]);

            refreshAllBalancesRef.current.progress = Math.round(((i + 1) / updated.length) * 100);
            if ((i + 1) % batchSize === 0)
                await sleep(30_000); // nghỉ 30s
        }

        cancelRef.current = false;
        refreshAllBalancesRef.current.isRefreshing = false;
        setLoading(false);
    };

    const generateWallets = async () => {
        if (amount < 1 || amount > 1000) {
            appContext.message?.warning('Vui lòng nhập số lượng từ 1 đến 1000');
            return;
        }

        setLoading(true);
        const list: Wallet[] = [];

        for (let i = 0; i < amount; i++) {
            const acc = await tronWeb.createAccount();
            const wallet: Wallet = {
                key: i.toString(),
                privateKey: acc.privateKey,
                address: acc.address.base58,
            }
            try {
                const gasFreeAddress = tronGasFree.generateGasFreeAddress(acc.address.base58);
                wallet.gasFreeAddress = gasFreeAddress;
            } catch (error) {
                console.error('Error generating GasFree address:', error);
            } finally {
                list.push(wallet);
            }
        }

        setWallets(list);
        setLoading(false);
    };

    const exportCSV = () => {
        const lines = ['private_key,address,gasFreeAddress', ...wallets.map(w => `${w.privateKey},${w.address},${w.gasFreeAddress}`)];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'tron_wallets.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const columns: ColumnsType<Wallet> = [
        // Private Key
        {
            title: `${wallets.length} Private Key`,
            dataIndex: 'privateKey',
            key: 'privateKey',
            render: (text: string) => (
                <Input value={text} suffix={<BtnCopy value={text} readOnly />} />
            ),
        },
        // Address
        {
            title: `${wallets.length} Address`,
            dataIndex: 'address',
            key: 'address',
            render: (text: string) => (
                <Input value={text} suffix={<BtnCopy value={text} readOnly />} />
            ),
        },
        // gasFreeAddress
        {
            title: `${wallets.length} gasFree address`,
            dataIndex: 'gasFreeAddress',
            key: 'gasFreeAddress',
            render: (text: string) => (
                <Input value={text} suffix={<BtnCopy value={text} readOnly />} />
            ),
        },
        // balance
        {
            title: (
                <Space>
                    {t("Balance")} (TRX)

                    {refreshAllBalancesRef.current.isRefreshing === false && <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={refreshAllBalances}
                        title={t("Get all balances")}
                        disabled={!wallets.length}
                    />}

                    {refreshAllBalancesRef.current.isRefreshing === true && <Popover title={
                        <Progress type='circle' percent={refreshAllBalancesRef.current.progress} size="small" />
                    } open={refreshAllBalancesRef.current.isRefreshing}>
                        <Button
                            danger
                            size="small"
                            onClick={() => {
                                cancelRef.current = true;
                            }}
                        >
                            {t("Cancel")}
                        </Button>
                    </Popover>}
                </Space>
            ),
            dataIndex: 'balance',
            key: 'balance',
            align: 'right',
            sorter: (a, b) => {
                const balA = a.balance ?? 0;
                const balB = b.balance ?? 0;
                return balA - balB;
            },
            showSorterTooltip: false,
            render: (_: any, record: Wallet) => (<Space>
                <Text>{record.balance !== undefined ? record.balance : '...'}</Text>
                <Button
                    size="small"
                    loading={record.loadingBalance}
                    onClick={() => refreshBalance(record)}
                    icon={<ReloadOutlined />}
                    title={t("Get balance")}
                />
            </Space>),
        }
    ];

    const filteredWallets = wallets.filter((w) =>
        w.address.toLowerCase().includes(search.toLowerCase()) ||
        w.privateKey.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 24 }}>
            <Typography.Title level={3}>{t("Generate Wallets")} TRON {t("in bulk")}</Typography.Title>

            <Space style={{ marginBottom: 16 }} wrap>
                <InputNumber
                    min={1}
                    max={10_000}
                    value={amount}
                    onChange={(value) => setAmount(value || 1)}
                    placeholder={t("Number of wallets")}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            generateWallets();
                        }
                    }}
                />

                <Button type="primary" loading={loading} onClick={generateWallets}>
                    {t("Generate Wallets")}
                </Button>

                <Button
                    icon={<DownloadOutlined />}
                    disabled={!wallets.length}
                    onClick={exportCSV}
                >
                    {t("CSV Export")}
                </Button>

                <Input
                    placeholder={t("Search wallet")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 300 }}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={filteredWallets}
                pagination={{ pageSize: 10 }}
                bordered
                scroll={{ x: true }}
            />
        </div>
    );
};

export default Tron;
