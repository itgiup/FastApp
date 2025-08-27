import { LuClipboardPaste } from "react-icons/lu";
import { useTranslation } from "react-i18next";

interface Props {
    name: string;
    onPaste: (name: string, text: string) => void
    title?: string
}


const BtnPaste: React.FC<Props> = ({ name, onPaste, title }) => {
    const { t } = useTranslation();

    return <LuClipboardPaste style={{ cursor: 'pointer' }} onClick={() => {
        navigator.clipboard.readText().then(data => {
            onPaste(name, data);
        });
    }}
        title={title || t('Paste')}
    />
}

export default BtnPaste;