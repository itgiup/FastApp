import React, { use, useState } from "react";
import { Tooltip } from "antd";
import { CopyOutlined, CheckOutlined, } from '@ant-design/icons';
import { useTranslation } from "react-i18next";

type Props = {
    [name: string]: any
    text?: string
    value?: string | number
}

const BtnCopy: React.FC<Props> = ({ text, value }) => {
    const [icon, seticon] = useState("🤘")
    const { t } = useTranslation();
    const copy = () => {
        // console.log(this.state.icon)
        navigator.clipboard.writeText(value?.toString() ?? "");
        seticon("✔️")
        setTimeout(() => {
            seticon("🤘")
        }, 1500);
    }
    return (<Tooltip title={t(text ? text : "Copy")}>
        <label style={styles.btnCopy} onClick={copy}>
            {icon === "🤘" ? <CopyOutlined /> : <CheckOutlined style={{ color: 'green' }} />}
        </label>
    </Tooltip>)
}


const styles = {
    btnCopy: {
        cursor: "pointer"
    },
    btnChecked: {
        cursor: "pointer", color: "green"
    },
}
export default BtnCopy;