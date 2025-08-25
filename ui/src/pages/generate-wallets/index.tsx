// src/pages/GenerateWallets.tsx
import { Outlet } from 'react-router-dom';
import { type FC } from 'react';

const GenerateWallets: FC = () => {
    return (
        <div>
            <h1>Generate Wallets</h1>
            {/* Route con như /generate-wallets/tron sẽ được hiển thị ở đây */}
            <Outlet />
        </div>
    );
};

export default GenerateWallets;
