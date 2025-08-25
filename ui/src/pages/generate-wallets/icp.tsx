import { type FC, useRef, useState } from 'react';
import {
    Button,
    InputNumber,
    Table,
    Typography,
    Space,
    Input,
    Progress,
    type GetProp,
    type TableProps,
    Popover,
} from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { HttpAgent } from '@dfinity/agent';
import { AccountIdentifier, LedgerCanister } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';

import { useTranslation } from 'react-i18next';
import { appContext } from '../../services';
import { BtnCopy } from '../../components';


type ColumnsType<T extends object> = GetProp<TableProps<T>, 'columns'>;

interface Wallet {
    key: string;
    privateKey: string;
    publicKey: string;
    address: string;
    balance?: number;
    loadingBalance?: boolean;
}


const { Text } = Typography;
const agent = HttpAgent.createSync({
    host: 'https://ic0.app',
});


const ICP: FC = () => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState<number>(1000);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
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
            const canister = LedgerCanister.create({ agent });
            const principal = Principal.fromText(wallet.address);
            const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });

            const balance = await canister.accountBalance({ accountIdentifier });

            setWallets(prev =>
                prev.map(w =>
                    w.key === wallet.key
                        ? { ...w, balance: Number(balance), loadingBalance: false }
                        : w
                )
            );
        } catch (error) {
            console.error('Lỗi lấy balance:', error);
            setWallets(prev =>
                prev.map(w =>
                    w.key === wallet.key ? { ...w, loadingBalance: false } : w
                )
            );
        }
    };

    const refreshAllBalances = async () => {
        const canister = LedgerCanister.create({ agent });
        const total = wallets.length;
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

        const updatedWallets: Wallet[] = [];

        for (let i = 0; i < total; i += batchSize) {
            if (cancelRef.current === true) {
                refreshAllBalancesRef.current.isRefreshing = false;
                setWallets(pre => {
                    pre.forEach(wallet => {
                        wallet.loadingBalance = false;
                    });
                    return [...pre];
                })
                break;
            }

            const batch = wallets.slice(i, i + batchSize);

            const updatedBatch = await Promise.all(
                batch.map(async (wallet) => {
                    try {
                        const principal = Principal.fromText(wallet.address);
                        const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
                        const balance = await canister.accountBalance({ accountIdentifier });

                        return {
                            ...wallet,
                            balance: Number(balance),
                            loadingBalance: false,
                        };
                    } catch (err) {
                        console.warn('Lỗi lấy balance:', wallet.address, err);
                        return {
                            ...wallet,
                            loadingBalance: false,
                        };
                    }
                })
            );

            updatedWallets.push(...updatedBatch);

            // Cập nhật UI tạm thời
            setWallets((prev) => {
                const map = new Map(updatedWallets.map((w) => [w.key, w]));
                return prev.map((w) => map.get(w.key) || w);
            });

            // Tính % tiến độ
            const done = Math.min(i + batchSize, total);
            refreshAllBalancesRef.current.progress = Math.round((done / total) * 100);
        }

        cancelRef.current = false;
        refreshAllBalancesRef.current.isRefreshing = false;
        setLoading(false);
    };


    const generateWallets = async () => {
        if (amount < 1 || amount > 1000) {
            appContext.message?.warning('Chọn từ 1 đến 1000 ví');
            return;
        }

        setLoading(true);
        const list: Wallet[] = [];

        for (let i = 0; i < amount; i++) {
            const identity = Ed25519KeyIdentity.generate();

            // Trả về [privateKeyUint8Array, publicKeyUint8Array]
            const [privateRaw, publicRaw] = identity.toJSON();
            const address = identity.getPrincipal().toText();

            list.push({
                key: i.toString(),
                privateKey: privateRaw,
                publicKey: publicRaw,
                address,
            });
        }

        setWallets(list);
        setLoading(false);
    };

    const exportCSV = () => {
        const lines = ['private_key,address', ...wallets.map(w => `${w.privateKey},${w.address}`)];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'icp_wallets.csv';
        a.click();
        URL.revokeObjectURL(url);
    };


    const columns: ColumnsType<Wallet> = [
        // Private Key
        {
            title: `${wallets.length} Private Key`,
            dataIndex: 'privateKey',
            render: (text: string) => <Input value={text} readOnly suffix={<BtnCopy value={text} readOnly />} />,
        },
        // Address
        {
            title: `${wallets.length} Address`,
            dataIndex: 'address',
            render: (text: string) => <Input value={text} readOnly suffix={<BtnCopy value={text} readOnly />} />,
        },
        // Balance
        {
            title: (
                <Space>
                    {t("Balance")} (ICP)

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
                </Space>),
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
        },
    ];

    const filteredWallets = wallets.filter((w) =>
        w.address.toLowerCase().includes(search.toLowerCase()) ||
        w.privateKey.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 24 }}>
            <Typography.Title level={3}>Tạo ví ICP hàng loạt</Typography.Title>

            <Space style={{ marginBottom: 16 }} wrap>
                <InputNumber
                    min={1}
                    max={1000}
                    value={amount}
                    onChange={(value) => setAmount(value || 1)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') generateWallets();
                    }}
                />
                <Button type="primary" onClick={generateWallets} loading={loading}>
                    Tạo ví
                </Button>
                <Button disabled={!wallets.length} onClick={exportCSV} icon={<DownloadOutlined />}>
                    Xuất CSV
                </Button>
                <Input
                    placeholder="Tìm kiếm ví"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 300 }}
                />

            </Space>

            <Table
                dataSource={filteredWallets}
                columns={columns}
                pagination={{ pageSize: 10 }}
                bordered
                scroll={{ x: true }}
            />
        </div>
    );
};

export default ICP;
